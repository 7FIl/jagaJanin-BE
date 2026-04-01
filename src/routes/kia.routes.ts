import { FastifyInstance } from "fastify";
import { kiaController } from "../controllers/kia.controller.js";
import { saveFacilityCheckupSchema, savePhysicalCheckupSchema, saveChecklistSchema, saveLabSchema, saveHphtSchema } from "../schema/kia.schema.js";
import { ChecklistInput, FacilityCheckupInput, LabInput, PhysicalCheckupInput } from "../services/kia.service.js";

export async function kiaRoutes(fastify: FastifyInstance) {
    fastify.get("/data", { onRequest: [fastify.authenticate] }, kiaController.getFullKiaData.bind(kiaController));
    fastify.get("/facility-checkup", { onRequest: [fastify.authenticate] }, kiaController.getFacilityCheckupData.bind(kiaController));
    fastify.post<{ Body: Partial<FacilityCheckupInput> }>("/facility-checkup", { schema: saveFacilityCheckupSchema, onRequest: [fastify.authenticate] }, kiaController.saveFacilityCheckupData.bind(kiaController));
    fastify.get("/physical-checkup", { onRequest: [fastify.authenticate] }, kiaController.getPhysicalCheckupData.bind(kiaController));
    fastify.post<{ Body: Partial<PhysicalCheckupInput> }>("/physical-checkup", { schema: savePhysicalCheckupSchema, onRequest: [fastify.authenticate] }, kiaController.savePhysicalCheckupData.bind(kiaController));
    fastify.get("/checklist", { onRequest: [fastify.authenticate] }, kiaController.getChecklistData.bind(kiaController));
    fastify.post<{ Body: Partial<ChecklistInput> }>("/checklist", { schema: saveChecklistSchema, onRequest: [fastify.authenticate] }, kiaController.saveChecklistData.bind(kiaController));
    fastify.get("/lab", { onRequest: [fastify.authenticate] }, kiaController.getLabData.bind(kiaController));
    fastify.post<{ Body: Partial<LabInput> }>("/lab", { schema: saveLabSchema, onRequest: [fastify.authenticate] }, kiaController.saveLabData.bind(kiaController));
    fastify.post<{ Body: { hpht: string } }>("/hpht", { schema: saveHphtSchema, onRequest: [fastify.authenticate] }, kiaController.saveHpht.bind(kiaController));
    fastify.get("/csv-report", { onRequest: [fastify.authenticate] }, kiaController.downloadCsvReport.bind(kiaController));
    fastify.get("/pdf-report", { onRequest: [fastify.authenticate] }, kiaController.downloadPdfReport.bind(kiaController));
}
