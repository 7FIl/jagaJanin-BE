import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

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
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        return { id: user.id, fullName: user.full_name, email: user.email, role: user.role };
    }
    
}

export const authService = new AuthService();