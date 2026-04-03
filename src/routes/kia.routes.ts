import { FastifyInstance } from "fastify";
import { kiaController } from "../controllers/kia.controller.js";
import { saveFacilityCheckupSchema, savePhysicalCheckupSchema, saveChecklistSchema, saveLabSchema, saveHphtSchema, getFullKiaDataSchema, getFacilityCheckupDataSchema, getPhysicalCheckupDataSchema, getChecklistDataSchema, getLabDataSchema, downloadCsvReportSchema, downloadPdfReportSchema } from "../schema/kia.schema.js";
import { ChecklistInput, FacilityCheckupInput, LabInput, PhysicalCheckupInput } from "../services/kia.service.js";

export async function kiaRoutes(fastify: FastifyInstance) {
    fastify.get("/data", { schema: getFullKiaDataSchema, onRequest: [fastify.authenticate] }, kiaController.getFullKiaData.bind(kiaController));
    fastify.get("/facility-checkup", { schema: getFacilityCheckupDataSchema, onRequest: [fastify.authenticate] }, kiaController.getFacilityCheckupData.bind(kiaController));
    fastify.post<{ Body: Partial<FacilityCheckupInput> }>
    ("/facility-checkup", { schema: saveFacilityCheckupSchema, onRequest: [fastify.authenticate] }, kiaController.saveFacilityCheckupData.bind(kiaController));
    fastify.get("/physical-checkup", { schema: getPhysicalCheckupDataSchema, onRequest: [fastify.authenticate] }, kiaController.getPhysicalCheckupData.bind(kiaController));
    fastify.post<{ Body: Partial<PhysicalCheckupInput> }>
    ("/physical-checkup", { schema: savePhysicalCheckupSchema, onRequest: [fastify.authenticate] }, kiaController.savePhysicalCheckupData.bind(kiaController));
    fastify.get("/checklist", { schema: getChecklistDataSchema, onRequest: [fastify.authenticate] }, kiaController.getChecklistData.bind(kiaController));
    fastify.post<{ Body: Partial<ChecklistInput> }>
    ("/checklist", { schema: saveChecklistSchema, onRequest: [fastify.authenticate] }, kiaController.saveChecklistData.bind(kiaController));
    fastify.get("/lab", { schema: getLabDataSchema, onRequest: [fastify.authenticate] }, kiaController.getLabData.bind(kiaController));
    fastify.post<{ Body: Partial<LabInput> }>
    ("/lab", { schema: saveLabSchema, onRequest: [fastify.authenticate] }, kiaController.saveLabData.bind(kiaController));
    fastify.post<{ Body: { hpht: string } }>
    ("/hpht", { schema: saveHphtSchema, onRequest: [fastify.authenticate] }, kiaController.saveHpht.bind(kiaController));
    fastify.get("/csv-report", { schema: downloadCsvReportSchema, onRequest: [fastify.authenticate] }, kiaController.downloadCsvReport.bind(kiaController));
    fastify.get("/pdf-report", { schema: downloadPdfReportSchema, onRequest: [fastify.authenticate] }, kiaController.downloadPdfReport.bind(kiaController));
}
