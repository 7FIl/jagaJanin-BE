
import { end } from "pdfkit";
import { db } from "../db/index.js";
import { doctor_profile, consultation, practice_schedule, ratings, users } from "../db/schema.js";
import { eq, and, desc, gte, is } from "drizzle-orm";

interface consultationData {
    consulationSchedule: consultationScheduleResponse;
    doctorRecomendation: doctorRecomendationResponse;
}

interface consultationScheduleResponse {
    id: string;
    date: string;
    doctorName: string;
}

interface doctorRecomendation {
    name: string;
    specialty: string;
    experience: number;
    fee: number;
    rating: string;
}

interface doctorRecomendationResponse {
    doctors: doctorRecomendation[];
}

interface practiceSchedule {
    startDay: string;
    endDay: string;
    startTime: string;
    endTime: string;
    session: string;
}

interface doctorProfileResponse {
    name: string;
    specialty: string;
    workPlace: string;
    experience: number;
    patients: number;
    rating: string;
    about: string;
    consultationFee: number;
    practiceSchedule: practiceSchedule[];
}

interface consultationBookingResponse {
    id: string;
    doctorName: string;
    date: string;
    time: string;
}

interface consultationBefore extends consultationBookingResponse {
    isTimeToConsult: boolean;
}

interface consultationAfter extends consultationBookingResponse {
    isDone: boolean;
    isDoneRating: boolean;
}

interface paginationParams {
    page?: number;
    limit?: number;
}

interface paginationMetadata {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface paginatedConsultationHistoryResponse {
    done: {
        data: consultationAfter[];
        pagination: paginationMetadata;
    };
    upcoming: {
        data: consultationBefore[];
        pagination: paginationMetadata;
    };
}

interface paginatedDoctorRecommendationResponse {
    data: doctorRecomendation[];
    pagination: paginationMetadata;
}

interface paymentConfirmationResponse {
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    doctorFee: number;
    platformFee: number;
    totalFee: number;
    paymentMethod: string[];
}

export function getDayName(dayNumber: number): string {
    const dayNames: { [key: number]: string } = {
        1: "Senin",
        2: "Selasa",
        3: "Rabu",
        4: "Kamis",
        5: "Jum'at",
        6: "Sabtu",
        7: "Minggu",
    };
    return dayNames[dayNumber] || "";
}

export class ConsultationService {

    async getDoctorRecommendations(params?: paginationParams): Promise<paginatedDoctorRecommendationResponse> {
        const page = params?.page || 1;
        const limit = params?.limit || 5;
        const offset = (page - 1) * limit;

        const allDoctors = await db
            .select({
                name: users.full_name,
                specialty: doctor_profile.specialization,
                experience: doctor_profile.experience_years,
                fee: doctor_profile.consultation_fee,
                rating: doctor_profile.rating,
            })
            .from(doctor_profile)
            .innerJoin(users, eq(doctor_profile.user_id, users.id));

        const total = allDoctors.length;
        const totalPages = Math.ceil(total / limit);
        
        // Paginate in memory
        const paginatedDoctors = allDoctors.slice(offset, offset + limit);

        return {
            data: paginatedDoctors as doctorRecomendation[],
            pagination: {
                page,
                limit,
                total,
                totalPages,
            }
        };
    }

    async getDoctorProfile(doctorId: string): Promise<doctorProfileResponse> {
        const [doctorData] = await db
            .select({
                id: doctor_profile.id,
                name: users.full_name,
                specialty: doctor_profile.specialization,
                workPlace: doctor_profile.work_place,
                experience: doctor_profile.experience_years,
                patients: doctor_profile.cumulative_patients,
                rating: doctor_profile.rating,
                about: doctor_profile.about,
                consultationFee: doctor_profile.consultation_fee,
                userId: doctor_profile.user_id,
            })
            .from(doctor_profile)
            .innerJoin(users, eq(doctor_profile.user_id, users.id))
            .where(eq(doctor_profile.id, doctorId));

        if (!doctorData) {
            throw new Error("Doctor not found");
        }

        const schedulesRaw = await db
            .select({
                startDay: practice_schedule.day_start,
                endDay: practice_schedule.day_end,
                startTime: practice_schedule.start_time,
                endTime: practice_schedule.end_time,
                session: practice_schedule.session,
            })
            .from(practice_schedule)
            .where(eq(practice_schedule.doctor_id, doctorData.id));

        const schedules = schedulesRaw.map((schedule) => ({
            startDay: getDayName(schedule.startDay),
            endDay: getDayName(schedule.endDay),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            session: schedule.session,
        }));

        return {
            ...doctorData,
            practiceSchedule: schedules,
        };
    }


    async getConsultationHistory(userId: string, params?: paginationParams): Promise<paginatedConsultationHistoryResponse> {
        const page = params?.page || 1;
        const limit = params?.limit || 5;
        const offset = (page - 1) * limit;

        const consultations = await db
            .select({
                id: consultation.id,
                doctorName: users.full_name,
                startTime: consultation.start_time,
                endTime: consultation.end_time,
                isDone: consultation.is_done,
                isDoneRating: consultation.is_done_rating,
            })
            .from(consultation)
            .innerJoin(doctor_profile, eq(consultation.doctor_id, doctor_profile.id))
            .innerJoin(users, eq(doctor_profile.user_id, users.id))
            .where(eq(consultation.user_id, userId))
            .orderBy(desc(consultation.start_time));

        const now = new Date();
        const done: consultationAfter[] = [];
        const upcoming: consultationBefore[] = [];

        for (const cons of consultations) {
            // Ensure dates are Date objects
            const consTime = cons.startTime instanceof Date ? cons.startTime : new Date(cons.startTime as any);
            const constEndTime = cons.endTime instanceof Date ? cons.endTime : new Date(cons.endTime as any);
            
            const baseData = {
                id: cons.id,
                doctorName: cons.doctorName || "Unknown Doctor",
                date: consTime.toISOString().split("T")[0] || "",
                time: consTime.toISOString().split("T")[1]?.split(".")[0] || "",
            };
            
            if (!cons.isDone && constEndTime < now) {
                await db
                    .update(consultation)
                    .set({ is_done: true })
                    .where(eq(consultation.id, cons.id));
                done.push({
                    ...baseData,
                    isDone: true,
                    isDoneRating: cons.isDoneRating,
                });
            } else {
                upcoming.push({
                    ...baseData,
                    isTimeToConsult: consTime <= now && constEndTime > now,
                });
            }
        }

        const doneTotal = done.length;
        const doneTotalPages = Math.ceil(doneTotal / limit);
        const donePaginated = done.slice(offset, offset + limit);

        const upcomingTotal = upcoming.length;
        const upcomingTotalPages = Math.ceil(upcomingTotal / limit);
        const upcomingPaginated = upcoming.slice(offset, offset + limit);

        return {
            done: {
                data: donePaginated,
                pagination: {
                    page,
                    limit,
                    total: doneTotal,
                    totalPages: doneTotalPages,
                }
            },
            upcoming: {
                data: upcomingPaginated,
                pagination: {
                    page,
                    limit,
                    total: upcomingTotal,
                    totalPages: upcomingTotalPages,
                }
            }
        };
    }

    async getConsultationData(userId: string): Promise<consultationData> {
        const userConsultations = await db
            .select({
                id: consultation.id,
                doctorName: users.full_name,
                startTime: consultation.start_time,
            })
            .from(consultation)
            .innerJoin(doctor_profile, eq(consultation.doctor_id, doctor_profile.id))
            .innerJoin(users, eq(doctor_profile.user_id, users.id))
            .where(and(
                eq(consultation.user_id, userId),
                eq(consultation.is_done, false),
                gte(consultation.start_time, new Date())
            ))
            .orderBy(desc(consultation.start_time))
            .limit(1);

        const userConsultation = userConsultations.length > 0 ? userConsultations[0] : null;

        const consultationSchedule: consultationScheduleResponse = userConsultation
            ? {
                id: userConsultation.id,
                date: new Date(userConsultation.startTime).toISOString().split("T")[0]!,
                doctorName: userConsultation.doctorName,
            }
            : {
                id: "",
                date: "",
                doctorName: "",
            };

        const doctorRecommendationsResponse = await this.getDoctorRecommendations();

        return {
            consulationSchedule: consultationSchedule,
            doctorRecomendation: {
                doctors: doctorRecommendationsResponse.data,
            },
        };
    }

    async callDoctor(userId: string): Promise<string> {
            const consultationDataArray = await db
            .select({
                doctorName: users.full_name,
                doctorPhone: users.phone_number,
            })
            .from(consultation)
            .innerJoin(doctor_profile, eq(consultation.doctor_id, doctor_profile.id))
            .innerJoin(users, eq(doctor_profile.user_id, users.id))
            .where(and(
                eq(consultation.is_paid, true),
                eq(consultation.user_id, userId),
                eq(consultation.is_done_rating, false),
                gte(consultation.start_time, new Date())
            ))
            .orderBy(desc(consultation.start_time))
            .limit(1);

        const consultationData = consultationDataArray.length > 0 ? consultationDataArray[0] : null;

        if (!consultationData) {
            throw new Error("No upcoming consultation found");
        }

        const normalizedPhone = consultationData.doctorPhone.replace(/^\+62/, "0").replace(/\D/g, "");

        const link = `https://wa.me/${normalizedPhone}?text=Halo%20Dokter%20${encodeURIComponent(consultationData.doctorName)},%20saya%20ingin%20konsultasi.`;

        return link;
    }

    async giveRating(consultationId: string, userId: string, ratingValue: number): Promise<boolean> {
        
        const [verifyConsultation] = await db
            .select({
                isDone: consultation.is_done,
                isDoneRating: consultation.is_done_rating,
                doctorId: consultation.doctor_id,
            })
            .from(consultation)
            .where(and(
                eq(consultation.id, consultationId),
                eq(consultation.user_id, userId)
            ))
            .limit(1);

        if (!verifyConsultation!.isDone) {
            throw new Error("Consultation is not completed yet");
        }

        if (verifyConsultation!.isDoneRating) {
            throw new Error("You have already rated this consultation");
        }
        
        const doctorId = verifyConsultation!.doctorId;

        await db.insert(ratings).values({
            doctor_id: doctorId,
            user_id: userId,
            rating: ratingValue,
        });

        const doctorRatings = await db
            .select({
                rating: ratings.rating,
            })
            .from(ratings)
            .where(eq(ratings.doctor_id, doctorId));

        const averageRating = doctorRatings.reduce((sum, r) => sum + parseFloat(String(r.rating))!, 0) / doctorRatings.length;

        await db
            .update(doctor_profile)
            .set({ rating: averageRating.toFixed(2) })
            .where(eq(doctor_profile.id, doctorId));

        await db
            .update(consultation)
            .set({ is_done_rating: true })
            .where(eq(consultation.id, consultationId));

        return true;
    }

    async bookConsultation(userId: string, doctorId: string, startTime: Date, endTime: Date): Promise<string> {
        const [result] = await db.insert(consultation).values({
            doctor_id: doctorId,
            user_id: userId,
            start_time: startTime,
            end_time: endTime,
        }).returning({ id: consultation.id });
        const consultationid = result!.id;

        return consultationid;
    }

    async getPaymentConfirmation(consultationId: string, userId: string): Promise<paymentConfirmationResponse> {
            const verifyConsultations = await db
                .select({
                    doctorName: users.full_name,
                    specialty: doctor_profile.specialization,
                    date: consultation.start_time,
                    fee: doctor_profile.consultation_fee,
                })
                .from(consultation)
                .innerJoin(doctor_profile, eq(consultation.doctor_id, doctor_profile.id))
                .innerJoin(users, eq(doctor_profile.user_id, users.id))
                .where(and(
                    eq(consultation.id, consultationId),
                    eq(consultation.user_id, userId)
                ))
                .limit(1);
            
            const verifyConsultation = verifyConsultations.length > 0 ? verifyConsultations[0] : null;
            
            if (!verifyConsultation) {
                throw new Error("Consultation not found");
            }
    
            const platformFee = Math.round(verifyConsultation.fee * 0.1);
            const totalFee = verifyConsultation.fee + platformFee;
    
            return {
                doctorName: verifyConsultation.doctorName,
                specialty: verifyConsultation.specialty,
                date: new Date(verifyConsultation.date).toISOString().split("T")[0]!,
                time: new Date(verifyConsultation.date).toISOString().split("T")[1]!,
                doctorFee: verifyConsultation.fee,
                platformFee: platformFee,
                totalFee: totalFee,
                paymentMethod: ["Credit Card", "Bank Transfer", "E-Wallet"],
            };
        }
}

export const consultationService = new ConsultationService();