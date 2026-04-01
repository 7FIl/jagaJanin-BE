import { db } from "../db/index.js";
import { otp, refresh_tokens, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import "dotenv/config";
import { FastifyInstance } from "fastify";
import { sendVerificationEmail } from "../lib/resend.js";

const jwtExp = process.env.JWT_EXPIRATION as string;

if (!jwtExp) {
    throw new Error("JWT_EXPIRATION environment variable is required");
}

export interface loginInput {
    email: string;
    password: string;
}

export interface registerInput {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export interface userResponse {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export interface userDetail extends userResponse {
    phoneNumber: string;
    avatarUrl: string;
}

export interface otpInput {
    email: string;
    code: string;
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


export class AuthService {
    
    async checkUserExists(email: string): Promise<boolean> {
        const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
        return !!user;
    }

    async createNewUser(input: registerInput): Promise<userResponse> {
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const [newUser] = await db
        .insert(users)
        .values({
            full_name: input.fullName,
            email: input.email,
            password: hashedPassword,
            phone_number: input.phoneNumber,
        })
        .returning({ 
            id: users.id,
            fullName: users.full_name,
            email: users.email,
            role: users.role
        });
        
        return newUser!;
    }

    async verifyUserCredentials(input: loginInput): Promise<userResponse> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const isVerified = user.is_verified;
        if (!isVerified) {
            throw new Error("Please verify your email before logging in");
        }
        
        return { id: user.id, fullName: user.full_name, email: user.email, role: user.role };
    }

    async getUserById(userId: string): Promise<userDetail> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            throw new Error("User not found");
        }

        return { id: user.id, fullName: user.full_name, email: user.email, role: user.role, phoneNumber: user.phone_number, avatarUrl: user.avatar_url };
    }

    async generateRefreshToken(userId: string): Promise<string> {
        const tokenId = crypto.randomUUID();
        const secret = crypto.randomBytes(64).toString("hex");
        const rawToken = tokenId + "." + secret;

        const hash = await bcrypt.hash(rawToken, 10)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.insert(refresh_tokens).values({
            id: tokenId,
            user_id: userId,
            token: hash,
            expires_at: expiresAt,
        });
        
        return rawToken;
    }

    async generateAccessToken(user: userResponse, fastify: FastifyInstance): Promise<string> {
        return fastify.jwt.sign(
            { sub: user.id, role: user.role },
            { expiresIn: jwtExp }
        );
    }

    async validateRefreshToken(token: string): Promise<{ valid: boolean, userId?: string, tokenId?: string }> {
        const [tokenId, secret] = token.split(".") as [string, string];

        if (!tokenId || !secret) {
            throw new Error("Invalid refresh token format");
        }

        const [storedToken] = await db
            .select()
            .from(refresh_tokens)
            .where(eq(refresh_tokens.id, tokenId))
            .limit(1);
        
        if (!storedToken) {
            throw new Error("Please re-login to get a new refresh token");
        }
        
        const isTokenValid = await bcrypt.compare(token, storedToken.token);

        if (!isTokenValid || storedToken.expires_at < new Date()) {
            throw new Error("Expired refresh token");
        }

        return { valid: true, userId: storedToken.user_id, tokenId };
    }

    async rotateRefreshToken(token: string, fastify: FastifyInstance): Promise<{ accessToken: string; refreshToken: string }> {
        const { valid, userId, tokenId } = await this.validateRefreshToken(token);

        if (!valid || !userId || !tokenId) {
            throw new Error("Please re-login to get a new refresh token");
        }

        await db.delete(refresh_tokens).where(eq(refresh_tokens.id, tokenId));

        const user = await this.getUserById(userId);
        const newRefreshToken = await this.generateRefreshToken(userId);
        const newAccessToken = await this.generateAccessToken(user, fastify);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    async revokeRefreshToken(userId: string): Promise<void> {
        await db.delete(refresh_tokens).where(eq(refresh_tokens.user_id, userId));
    }

    async sendOtp(email: string): Promise<boolean> {
        const code = generateOtp();
        const hashCode = await bcrypt.hash(code, 10);

        await db.delete(otp).where(eq(otp.email, email));

        await db.insert(otp).values({
            email,
            code: hashCode,
            expires_at: new Date(Date.now() + 5 * 60 * 1000),
        });
        
        await sendVerificationEmail(email, code);

        return true;
    }

    async verifyOtp(input: otpInput): Promise<boolean> {
        const [otpRecord] = await db
            .select()
            .from(otp)
            .where(eq(otp.email, input.email))
            .limit(1);
        
        if (!otpRecord) {
            throw new Error("OTP not found");
        }

        const isCodeValid = await bcrypt.compare(input.code, otpRecord.code);
        if (!isCodeValid || otpRecord.expires_at < new Date()) {
            throw new Error("Invalid or expired OTP");
        }
        await db.delete(otp).where(eq(otp.email, input.email));
        await db.update(users).set({ is_verified: true }).where(eq(users.email, input.email));

        return true;
    }

}

export const authService = new AuthService();