import { db } from "../db/index.js";
import { doctor_profile, consultation, users, payment } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { Invoice } from "../lib/xendit.js";

interface xenditInvoiceResponse {
    invoiceId: string;
    status: string;
    invoiceUrl: string;
    expiryDate: string;
    amount: number;
}

export class PaymentService {
    async createConsultationPayment(consultationId: string, userId: string): Promise<xenditInvoiceResponse> {
        const [verifyConsultation] = await db
            .select({
                doctorName: users.full_name,
                fee: doctor_profile.consultation_fee,
                startTime: consultation.start_time,
            })
            .from(consultation)
            .innerJoin(doctor_profile, eq(consultation.doctor_id, doctor_profile.id))
            .innerJoin(users, eq(doctor_profile.user_id, users.id))
            .where(and(
                eq(consultation.id, consultationId),
                eq(consultation.user_id, userId)
            ))
            .limit(1);

        if (!verifyConsultation) {
            throw new Error("Consultation not found");
        }

        const [userProfile] = await db
            .select({
                fullName: users.full_name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const platformFee = Math.round(verifyConsultation.fee * 0.05);
        const totalAmount = verifyConsultation.fee + platformFee;

        try {
            const invoiceData = {
                externalId: `consultation-${consultationId}`,
                amount: totalAmount,
                description: `Consultation Payment with Dr. ${verifyConsultation.doctorName}`,
                invoiceDuration: 86400,
                customer: {
                    givenNames: `${userProfile!.fullName}`,
                    email: `${userProfile!.email}`,
                },
                items: [
                    {
                        name: `Consultation with Dr. ${verifyConsultation.doctorName}`,
                        quantity: 1,
                        price: verifyConsultation.fee,
                    },
                    {
                        name: "Platform Fee",
                        quantity: 1,
                        price: platformFee,
                    },
                ],
            };

            const invoice = await Invoice.createInvoice( { data: invoiceData } );

            await db.insert(payment).values({
                user_id: userId,
                amount: totalAmount,
                status: "pending",
                external_id: invoice.id!,
            });

            return {
                invoiceId: invoice.id!,
                status: invoice.status!,
                invoiceUrl: invoice.invoiceUrl!,
                expiryDate: new Date(invoice.expiryDate!).toISOString(),
                amount: totalAmount,
            };
        } catch (error) {
            throw new Error(`Failed to create Xendit invoice: ${error}`);
        }
    }

    async checkPaymentStatus(invoiceId: string): Promise<string> {
        try {
            const [invoice] = await Invoice.getInvoices({ lastInvoice: invoiceId });
            return invoice!.status;
        } catch (error) {
            throw new Error(`Failed to check payment status: ${error}`);
        }
    }

    async handlePaymentWebhook(invoiceId: string, status: string): Promise<boolean> {
        try {
            const [paymentRecord] = await db
                .select({
                    id: payment.id,
                    userId: payment.user_id,
                })
                .from(payment)
                .where(eq(payment.external_id, invoiceId))
                .limit(1);

            if (!paymentRecord) {
                throw new Error("Payment record not found");
            }

            await db
                .update(payment)
                .set({ status: status.toLowerCase() })
                .where(eq(payment.id, paymentRecord.id));

            if (status.toLowerCase() === "paid") {
                await db
                    .update(consultation)
                    .set({ is_paid: true })
                    .where(and(
                        eq(consultation.user_id, paymentRecord.userId),
                        eq(consultation.is_paid, false)
                    ));
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to handle payment webhook: ${error}`);
        }
    }

    async getPaymentHistory(userId: string): Promise<Array<any>> {
        const payments = await db
            .select({
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                createdAt: payment.created_at,
            })
            .from(payment)
            .where(eq(payment.user_id, userId));

        return payments;
    }
}

export const paymentService = new PaymentService();
