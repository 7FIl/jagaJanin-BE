import { db } from "../db/index.js";
import { foods, pregnancy_profile, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { supabase } from "../lib/supabase.js";
import bcrypt from "bcrypt";

export interface userProfileResponse {
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string | undefined;
}

export interface updateProfileInput {
    fullName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
}

export interface updatePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export async function getUserId(id: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}


export class ProfileService {

    async userProfile(userId: string): Promise<userProfileResponse> {
        const user = await getUserId(userId);

        let avatarUrl: string | undefined;
        if (user.avatar_url) {
            if (user.avatar_url.startsWith("http")) {
                avatarUrl = user.avatar_url; // External URL from Google
            } else {
                const { data } = supabase.storage.from("avatars").getPublicUrl(user.avatar_url);
                avatarUrl = data.publicUrl;
            }
        }

        return { fullName: user.full_name, email: user.email, phoneNumber: user.phone_number, avatarUrl };
    }

    async updateEmail(userId: string, email: string,password: string): Promise<string> {
        const user = await getUserId(userId);

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
            throw new Error("Failed to update user email");
        }

        return updatedUser.email;

    }

    async updateUserProfile(userId: string, fullName?: string, email?: string, password?: string): Promise<userProfileResponse> {
            
        const [updatedUser] = await db
            .update(users)
            .set({ full_name: fullName, updated_at: new Date() })
            .where(eq(users.id, userId))
            .returning({ fullName: users.full_name, email: users.email, phoneNumber: users.phone_number })

        if (!updatedUser) {
            throw new Error("User not found");
        }

        if (email !== undefined && password === undefined){
            throw new Error("Password is required to change email");
        }

        if (email === undefined && password !== undefined) {
            throw new Error("Email is required to change password");
        }

        if (email !== undefined && password !== undefined) {
            const updatedEmail = await this.updateEmail(userId, email, password);
            return { fullName: updatedUser.fullName, email: updatedEmail, phoneNumber: updatedUser.phoneNumber };
        }
        
        return { fullName: updatedUser.fullName, email: updatedUser.email, phoneNumber: updatedUser.phoneNumber };
    }

    async updatePhoneNumber(userId: string, phoneNumber: string): Promise<string> {
        const [updatedUser] = await db
            .update(users)
            .set({ phone_number: phoneNumber, updated_at: new Date() })
            .where(eq(users.id, userId))
            .returning({ phoneNumber: users.phone_number });

        if (!updatedUser) {
            throw new Error("Failed to update phone number");
        }

        return updatedUser.phoneNumber;
    }

    async editPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = await getUserId(userId);

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid current password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db
            .update(users)
            .set({ password: hashedNewPassword , updated_at: new Date() })
            .where(eq(users.id, userId));
        
        return true;
    }

    async updatePreference (userId: string, foodPreference: number): Promise<boolean> {

        const [foodPrefExists] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, foodPreference))
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

    async updateAvatar(userId: string, file: any): Promise<boolean> {
        
        const user = await getUserId(userId);

        if (!file) {
            throw new Error("No file uploaded");
        }
        
        if (!file.mimetype.startsWith("image/")) {
            throw new Error("Invalid file type. Only images are allowed.");
        }
        
        const buffer = await file.toBuffer();
        const extension = file.filename.split('.').pop();
        const filePath = `avatars/${userId}.${Date.now()}.${extension}`;
        const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (user.avatar_url !== "avatars/default.png") {
            await supabase.storage
                .from("avatars")
                .remove([user.avatar_url]);
        }
        
        const { data } = await supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        await db.
            update(users)
            .set({ avatar_url: filePath, updated_at: new Date() })
            .where(eq(users.id, userId));
        
        return true;

    }

    async avatarUrl(userId: string): Promise<string> {
        const user = await getUserId(userId);

        if (!user.avatar_url) {
            throw new Error("User has no avatar");
        }

        if (user.avatar_url.startsWith("http")) {
            return user.avatar_url; // External URL from Google
        }

        const { data } = supabase.storage.from("avatars").getPublicUrl(user.avatar_url);
        return data.publicUrl;
    }
}

export const profileService = new ProfileService();