import { FastifyRequest, FastifyReply } from "fastify";
import { kiaServiceInstance } from "../services/kia.service.js";
import { FacilityCheckupInput, PhysicalCheckupInput, ChecklistInput, LabInput } from "../services/kia.service.js";

export class KiaController {
    async getFullKiaData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const kiaData = await kiaServiceInstance.getFullKiaData(userId);
            return reply.code(200).send({
                success: true,
                data: kiaData,
                message: "Full KIA data retrieved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async getFacilityCheckupData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const facilityData = await kiaServiceInstance.getFacilityCheckupData(userId);
            return reply.code(200).send({
                success: true,
                data: facilityData,
                message: "Facility checkup data retrieved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async saveFacilityCheckupData(
        request: FastifyRequest<{ Body: Partial<FacilityCheckupInput> }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const input = request.body;
            const result = await kiaServiceInstance.saveFacilityCheckupData(userId, input);
            return reply.code(201).send({
                success: true,
                data: result,
                message: "Facility checkup data saved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async getPhysicalCheckupData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const physicalData = await kiaServiceInstance.getPhysicalCheckupData(userId);
            return reply.code(200).send({
                success: true,
                data: physicalData,
                message: "Physical checkup data retrieved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async savePhysicalCheckupData(
        request: FastifyRequest<{ Body: Partial<PhysicalCheckupInput> }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const input = request.body;
            const result = await kiaServiceInstance.savePhysicalCheckupData(userId, input);
            return reply.code(201).send({
                success: true,
                data: result,
                message: "Physical checkup data saved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async getChecklistData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const checklistData = await kiaServiceInstance.getChecklistData(userId);
            return reply.code(200).send({
                success: true,
                data: checklistData,
                message: "Checklist data retrieved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async saveChecklistData(
        request: FastifyRequest<{ Body: Partial<ChecklistInput> }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const input = request.body;
            const result = await kiaServiceInstance.saveChecklistData(userId, input);
            return reply.code(201).send({
                success: true,
                data: result,
                message: "Checklist data saved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async getLabData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const labData = await kiaServiceInstance.getLabData(userId);
            return reply.code(200).send({
                success: true,
                data: labData,
                message: "Lab data retrieved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async saveLabData(
        request: FastifyRequest<{ Body: Partial<LabInput> }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const input = request.body;
            const result = await kiaServiceInstance.saveLabData(userId, input);
            return reply.code(201).send({
                success: true,
                data: result,
                message: "Lab data saved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async saveHpht(
        request: FastifyRequest<{ Body: { hpht: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const { hpht } = request.body;
            const result = await kiaServiceInstance.saveHpht(userId, new Date(hpht));
            return reply.code(201).send({
                success: true,
                data: { saved: result },
                message: "HPHT saved successfully"
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async downloadCsvReport(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const csvData = await kiaServiceInstance.getCsvReport(userId);
            
            const filename = `kia_report_${userId}_${new Date().getTime()}.csv`;
            
            return reply
                .header("Content-Type", "text/csv; charset=utf-8")
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(csvData);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async downloadPdfReport(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const pdfBuffer = await kiaServiceInstance.getPdfReport(userId);

            const filename = `kia_report_${userId}_${new Date().getTime()}.pdf`;

            return reply
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(pdfBuffer);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.code(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

}

export const kiaController = new KiaController();
