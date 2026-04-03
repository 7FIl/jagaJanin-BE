import { OAuth2Client, TokenPayload } from "google-auth-library";
import "dotenv/config";

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is required");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET environment variable is required");
}

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

export function getGoogleAuthUrl(): string {
    return Client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
    });
}

export async function getGoogleUser(code: string) {
    const { tokens } = await Client.getToken(code);
    Client.setCredentials(tokens);
    
    const ticket = await Client.verifyIdToken({
        idToken: tokens.id_token as string,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
}
