import { db } from "../db/index.js";
import { refresh_tokens, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import "dotenv/config";
import { FastifyInstance } from "fastify";

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
}

export interface userResponse {
    id: string;
    fullName: string;
    email: string;
    role: string;
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
        
        return { id: user.id, fullName: user.full_name, email: user.email, role: user.role };
    }

    async getUserById(userId: string): Promise<userResponse> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            throw new Error("User not found");
        }

        return { id: user.id, fullName: user.full_name, email: user.email, role: user.role };
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
            throw new Error("Invalid refresh token");
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
            throw new Error("Invalid refresh token");
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

}

export const authService = new AuthService();