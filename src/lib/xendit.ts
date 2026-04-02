import { Xendit } from 'xendit-node';

if (!process.env.XENDIT_API_KEY) {
    throw new Error("XENDIT_API_KEY environment variable is required");
}

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_API_KEY
});

export const { Invoice } = xenditClient;