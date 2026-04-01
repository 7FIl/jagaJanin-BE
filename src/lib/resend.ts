import { Resend } from "resend";
import "dotenv/config";

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, code: string) => {
    await resend.emails.send({
        from: "jagajanin <noreply@ragil.dev>",
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP code is: <strong>${code}</strong></p><p>This code will expire in 5 minutes.</p>`,
    });

    return true;
};
