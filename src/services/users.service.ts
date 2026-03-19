import { db } from "../db/index.js";
import { pregnancy_profile, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface userProfileResponse {
    fullName: string;
    email: string;
}

export interface updateProfileInput {
    fullName?: string;
    email?: string;
    password?: string;
}

export interface updatePasswordInput {
    currentPassword: string;
    newPassword: string;
}


export class UsersService {

    async UserProfile(userId: string): Promise<userProfileResponse> {

        const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

        if (!user) {
            throw new Error("User not found");
        }

        return { fullName: user.full_name, email: user.email };
    }

    async updateEmail(userId: string, email: string,password: string): Promise<string> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        const [updatedUser] = await db
        .update(users)
        .set({ email: email })
        .where(eq(users.id, userId))
        .returning({ fullName: users.full_name, email: users.email })

        if (!updatedUser) {
            throw new Error("User not found");
        }

        return updatedUser.email;

    }

    async updateUserProfile(userId: string, fullName?: string, email?: string, password?: string): Promise<userProfileResponse> {

        const [updatedUser] = await db
            .update(users)
            .set({ full_name: fullName, email})
            .where(eq(users.id, userId))
            .returning({ fullName: users.full_name, email: users.email })

        if (!updatedUser) {
            throw new Error("User not found");
        }

        if (email !== undefined && password == undefined){
            throw new Error("Password is required to change email");
        }

        if (email !== undefined && password !== undefined) {
            const updatedEmail = await this.updateEmail(userId, email, password);
            return { fullName: updatedUser.fullName, email: updatedEmail };
        }
        
        return { fullName: updatedUser.fullName, email: updatedUser.email };
    }

    async editPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid current password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db
            .update(users)
            .set({ password: hashedNewPassword })
            .where(eq(users.id, userId));
        
        return true;
    }

    async updatePreference (userId: string, foodPreference: number): Promise<boolean> {
        const [user] = await db
            .select()
            .from(pregnancy_profile)
            .where(eq(pregnancy_profile.user_id, userId))
            .limit(1);

        if (!user) {
            throw new Error("User not found");
        }

        const [foodPrefExists] = await db
            .select()
            .from(pregnancy_profile)
            .where(eq(pregnancy_profile.food_preference, foodPreference))
            .limit(1);

        if (!foodPrefExists) {
            throw new Error("Food does not exist");
        }

        await db
            .update(pregnancy_profile)
            .set({ food_preference: foodPreference })
            .where(eq(pregnancy_profile.user_id, userId));

        return true;

    }
}

export const usersService = new UsersService();