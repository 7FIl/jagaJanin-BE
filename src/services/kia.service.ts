import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { checkup, kia, checklist } from "../db/schema.js";
import { calculateTrimester } from "./form.service.js";
import { getPregnancyWeeks } from "./pregnancy.service.js";
import { stringify } from "csv-stringify/sync";
import PDFDocument from "pdfkit";
import { AppError } from "../lib/errorHandler.js";

interface kiaResponse {
    kiaData: kiaDataResponse;
    checkupData: { facility: kiaFacilityCheckupResponse; physical: kiaPhysicalCheckupResponse };
    checklistData: kiaChecklistResponse;
    labData: kiaLabResponse;
    progress: { progress: number; maxProgress: number };
    hpht: Date;
}

interface kiaDataResponse {
    weeks: number;
    trimester: number;
    hpl: Date;
}

interface kiaFacilityCheckupResponse {
    facilityName: string;
    doctorName: string;
    controlDate: Date;
}

interface kiaPhysicalCheckupResponse {
    bloodPressure: string;
    weight: number;
    height: number;
    fundalHeight: number;
    imt:number;
    lila: number;
}

interface kiaChecklistResponse {
    checklist: string[];
    isCompleted: boolean;
}

interface kiaLabResponse {
    hemoglobin: number;
    bloodType: string;
    bloodSugar: number;
    urineProtein: string;
}

export interface FacilityCheckupInput {
    facilityName: string;
    doctorName: string;
    controlDate: Date;
}

export interface PhysicalCheckupInput {
    bloodPressure: string;
    weight: number;
    height: number;
    fundalHeight: number;
    lila: number;
    bloodType: string;
    bloodSugar: number;
    urineProtein: string;
}

export interface ChecklistInput {
    fetalHeartbeat: boolean;
    counseling: boolean;
    tetanusImmunization: boolean;
    healthScreening: boolean;
    ironSupplement: boolean;
    ppia: boolean;
    isCompleted: boolean;
}

export interface LabInput {
    hemoglobin: number;
    bloodType: string;
    bloodSugar: number;
    urineProtein: string;
}

function calculateHPL(hpht: Date): Date {
    const hpl = new Date(hpht);
    hpl.setDate(hpl.getDate() + 280);
    return hpl;
}

function calculateHPLFromWeeks(weeks: number): Date {
    const hpl = new Date();
    hpl.setDate(hpl.getDate() + (280 - (weeks * 7)));
    return hpl;
}

function getHphtFromWeeks(weeks: number): Date {
    const hpht = new Date();
    hpht.setDate(hpht.getDate() - (weeks * 7));
    return hpht;
}

async function getKiaDataByUserId(userId: string) {
    const [kiaData] = await db
        .select()
        .from(kia)
        .where(eq(kia.user_id, userId))
        .limit(1);
    
    if (!kiaData) {
        throw new AppError("KIA data not found", 404);
    }
    return kiaData;
}

async function getLatestCheckupByKiaId(kiaId: string) {
    const [latestCheckup] = await db
        .select()
        .from(checkup)
        .where(eq(checkup.kia_id, kiaId))
        .orderBy(desc(checkup.checkup_date))
        .limit(1);
    
    if (!latestCheckup) {
        throw new AppError("No checkup data found", 404);
    }
    return latestCheckup;
}

async function convertUrineProteinValue(value: number): Promise<string> {
    switch (value) {
        case 1:
            return "Negative (-)";
        case 2:
            return "Positive (+)";
        default:
            return "-";
    }
}

async function calculateKiaProgress(userId: string): Promise<{progress: number, maxProgress: number}> {
    let progress = 0;
    const maxProgress = 12;
    
        const kiaData = await getKiaDataByUserId(userId);
        
        const latestCheckup = await getLatestCheckupByKiaId(kiaData.id);
        
        if (latestCheckup.facility_name !== "-") progress++;
        if (latestCheckup.doctor_name !== "-") progress++;
        if (latestCheckup.checkup_date) progress++;
        if (latestCheckup.blood_pressure !== "-") progress++;
        if (Number(latestCheckup.weight) !== 0) progress++;
        if (Number(latestCheckup.height) !== 0) progress++;
        if (Number(latestCheckup.fundal_height) !== 0) progress++;
        if (latestCheckup.lila !== 0) progress++;
        if (Number(latestCheckup.hemoglobin) !== 0) progress++;
        if (latestCheckup.blood_type !== "-") progress++;
        if (latestCheckup.blood_sugar !== 0) progress++;
        if (latestCheckup.urine_protein !== "-") progress++;
    
        const [checklistData] = await db
            .select()
            .from(checklist)
            .where(eq(checklist.kia_id, kiaData.id))
            .limit(1);
        
        if (checklistData && checklistData.is_completed === true) progress++;
    
        return { progress, maxProgress };
}
    



export class kiaService {

    async getKiaData(userId: string): Promise<kiaDataResponse> {
        const weeks = await getPregnancyWeeks(userId);

        try {
            const kiaData = await getKiaDataByUserId(userId);
            return {
                weeks: weeks,
                trimester: calculateTrimester(weeks),
                hpl: kiaData.hpl,
            };
        } catch {
            const [newKiaData] = await db
                .insert(kia)
                .values({
                    user_id: userId,
                    trimester: calculateTrimester(weeks),
                    hpl: calculateHPLFromWeeks(weeks),
                    hpht: getHphtFromWeeks(weeks),
                })
                .returning({
                    hpl: kia.hpl,
                });

            return {
                weeks: weeks,
                trimester: calculateTrimester(weeks),
                hpl: newKiaData!.hpl,
            };
        }
    }

    async saveFacilityCheckupData(
        userId: string,
        input: Partial<FacilityCheckupInput>
    ): Promise<kiaFacilityCheckupResponse> {
        const kiaData = await getKiaDataByUserId(userId);

        const updateValues: any = {};
        if (input.facilityName !== undefined) updateValues.facility_name = input.facilityName;
        if (input.doctorName !== undefined) updateValues.doctor_name = input.doctorName;
        if (input.controlDate !== undefined) updateValues.checkup_date = input.controlDate;

        if (Object.keys(updateValues).length === 0) {
            throw new AppError("At least one field must be provided", 400);
        }

        const [checkupData] = await db
            .update(checkup)
            .set(updateValues)
            .where(eq(checkup.kia_id, kiaData.id))
            .returning();

        if (!checkupData) {
            throw new AppError("Failed to update facility checkup data", 400);
        }
        
        return {
            facilityName: checkupData.facility_name,
            doctorName: checkupData.doctor_name,
            controlDate: checkupData.checkup_date,
        };
    }

    async getFacilityCheckupData(userId: string): Promise<kiaFacilityCheckupResponse> {
        const kiaData = await getKiaDataByUserId(userId);
        try{
        const latestCheckup = await getLatestCheckupByKiaId(kiaData.id);

        return {
            facilityName: latestCheckup.facility_name,
            doctorName: latestCheckup.doctor_name,
            controlDate: latestCheckup.checkup_date,

        };
        } catch {
            await db
            .insert(checkup)
            .values({
                kia_id: kiaData.id,
                checkup_date: new Date(),
            })
            .returning();
            return {
                facilityName: "-",
                doctorName: "-",
                controlDate: new Date(),
            };
        }
    }


    async savePhysicalCheckupData(
        userId: string,
        input: Partial<PhysicalCheckupInput>
    ): Promise<kiaPhysicalCheckupResponse> {
        const kiaData = await getKiaDataByUserId(userId);

        const updateValues: any = {};
        if (input.bloodPressure !== undefined) updateValues.blood_pressure = input.bloodPressure;
        if (input.weight !== undefined) updateValues.weight = input.weight;
        if (input.height !== undefined) updateValues.height = input.height;
        if (input.fundalHeight !== undefined) updateValues.fundal_height = input.fundalHeight;
        if (input.lila !== undefined) updateValues.lila = input.lila;
        if (input.bloodType !== undefined) updateValues.blood_type = input.bloodType;
        if (input.bloodSugar !== undefined) updateValues.blood_sugar = input.bloodSugar;
        if (input.urineProtein !== undefined) updateValues.urine_protein = input.urineProtein;

        if (Object.keys(updateValues).length === 0) {
            throw new AppError("At least one field must be provided", 400);
        }

        const [updatedCheckup] = await db
            .update(checkup)
            .set(updateValues)
            .where(eq(checkup.kia_id, kiaData.id))
            .returning();

        if (!updatedCheckup) {
            throw new AppError("Failed to update physical checkup data", 400);
        }
        const weight = Number(updatedCheckup.weight);
        const height = Number(updatedCheckup.height);
        return {
            bloodPressure: updatedCheckup.blood_pressure,
            weight: weight,
            height: height,
            fundalHeight: Number(updatedCheckup.fundal_height),
            imt: weight / (height ** 2),
            lila: updatedCheckup.lila,
        };
        
    }

    async getPhysicalCheckupData(userId: string): Promise<kiaPhysicalCheckupResponse> {
        const kiaData = await getKiaDataByUserId(userId);
        try {
            const latestCheckup = await getLatestCheckupByKiaId(kiaData.id);

        const weight = Number(latestCheckup.weight);
        const height = Number(latestCheckup.height);

        return {
            bloodPressure: latestCheckup.blood_pressure,
            weight: weight,
            height: height,
            fundalHeight: Number(latestCheckup.fundal_height),
            imt: weight / (height ** 2),
            lila: latestCheckup.lila,
        };
        } catch {
            await db
            .insert(checkup)
            .values({
                kia_id: kiaData.id,
                checkup_date: new Date(),
            })
            .returning();

            return {
                bloodPressure: "-",
                weight: 0,
                height: 0,
                fundalHeight: 0,
                imt: 0,
                lila: 0,
            };
        }

    }

    async saveChecklistData(
        userId: string,
        input: Partial<ChecklistInput>
    ): Promise<kiaChecklistResponse> {
        const kiaData = await getKiaDataByUserId(userId);

        const updateValues: any = {};
        if (input.fetalHeartbeat !== undefined) updateValues.fetal_heartbeat = input.fetalHeartbeat;
        if (input.counseling !== undefined) updateValues.counseling = input.counseling;
        if (input.tetanusImmunization !== undefined) updateValues.tetanus_immunization = input.tetanusImmunization;
        if (input.healthScreening !== undefined) updateValues.health_screening = input.healthScreening;
        if (input.ironSupplement !== undefined) updateValues.iron_supplement = input.ironSupplement;
        if (input.ppia !== undefined) updateValues.ppia = input.ppia;
        if (input.isCompleted !== undefined) updateValues.is_completed = input.isCompleted;

        if (Object.keys(updateValues).length === 0) {
            throw new AppError("At least one field must be provided", 400);
        }

        const [updatedChecklist] = await db
            .update(checklist)
            .set(updateValues)
            .where(eq(checklist.kia_id, kiaData.id))
            .returning();
        
            if (!updatedChecklist) {
            throw new AppError("Failed to update checklist data", 400);
        }

        const checklistItems = [];
        if (updatedChecklist.fetal_heartbeat) checklistItems.push("Fetal Heartbeat");
        if (updatedChecklist.counseling) checklistItems.push("Counseling");
        if (updatedChecklist.tetanus_immunization) checklistItems.push("Tetanus Immunization");
        if (updatedChecklist.health_screening) checklistItems.push("Health Screening");
        if (updatedChecklist.iron_supplement) checklistItems.push("Iron Supplement");
        if (updatedChecklist.ppia) checklistItems.push("PPIA");

        if (checklistItems.length === 6) {
            await db
                .update(checklist)                
                .set({ is_completed: true })
                .where(eq(checklist.kia_id, kiaData.id));
        }

        return {
            checklist: checklistItems,
            isCompleted: updatedChecklist.is_completed,
        };
    }

    async getChecklistData(userId: string): Promise<kiaChecklistResponse> {
        const kiaData = await getKiaDataByUserId(userId);

        const [checklistData] = await db
            .select()
            .from(checklist)
            .where(eq(checklist.kia_id, kiaData.id))
            .limit(1);

        if (!checklistData) {
            const [newChecklist] = await db
                .insert(checklist)
                .values({
                    kia_id: kiaData.id,
                })
                .returning();

            return {
                checklist: [
                    { name: "Fetal Heartbeat", completed: newChecklist!.fetal_heartbeat },
                    { name: "Counseling", completed: newChecklist!.counseling },
                    { name: "Tetanus Immunization", completed: newChecklist!.tetanus_immunization },
                    { name: "Health Screening", completed: newChecklist!.health_screening },
                    { name: "Iron Supplement", completed: newChecklist!.iron_supplement },
                    { name: "PPIA", completed: newChecklist!.ppia }
                ].map(item => item.name),
                isCompleted: false,
            };
        }

        const checklistItems = [];
        if (checklistData.fetal_heartbeat) checklistItems.push("Fetal Heartbeat");
        if (checklistData.counseling) checklistItems.push("Counseling");
        if (checklistData.tetanus_immunization) checklistItems.push("Tetanus Immunization");
        if (checklistData.health_screening) checklistItems.push("Health Screening");
        if (checklistData.iron_supplement) checklistItems.push("Iron Supplementation");
        if (checklistData.ppia) checklistItems.push("PPIA");

        return {
            checklist: checklistItems,
            isCompleted: checklistData.is_completed,
        };
    }

    async saveLabData(
        userId: string,
        input: Partial<LabInput>
    ): Promise<kiaLabResponse> {
        const kiaData = await getKiaDataByUserId(userId);

        const updateValues: any = {};
        if (input.hemoglobin !== undefined) updateValues.hemoglobin = input.hemoglobin;
        if (input.bloodType !== undefined) updateValues.blood_type = input.bloodType;
        if (input.bloodSugar !== undefined) updateValues.blood_sugar = input.bloodSugar;
        if (input.urineProtein !== undefined) updateValues.urine_protein = input.urineProtein;

        if (Object.keys(updateValues).length === 0) {
            throw new AppError("At least one field must be provided", 400);
        }

        const [updatedCheckup] = await db
            .update(checkup)
            .set(updateValues)
            .where(eq(checkup.kia_id, kiaData.id))
            .returning();
        
            if (!updatedCheckup) {
            throw new AppError("Failed to update lab data", 400);
        }

        return {
            hemoglobin: Number(updatedCheckup.hemoglobin),
            bloodType: updatedCheckup.blood_type,
            bloodSugar: updatedCheckup.blood_sugar,
            urineProtein: await convertUrineProteinValue(Number(updatedCheckup.urine_protein)),
        };
    }

    async getLabData(userId: string): Promise<kiaLabResponse> {
        const kiaData = await getKiaDataByUserId(userId);
        try{
        const latestCheckup = await getLatestCheckupByKiaId(kiaData.id);

        return {
            hemoglobin: Number(latestCheckup.hemoglobin),
            bloodType: latestCheckup.blood_type,
            bloodSugar: latestCheckup.blood_sugar,
            urineProtein: await convertUrineProteinValue(Number(latestCheckup.urine_protein)),
        };
        } catch {
            await db
            .insert(checkup)
            .values({
                kia_id: kiaData.id,
                checkup_date: new Date(),
            })
            .returning();

            return {
                hemoglobin: 0,
                bloodType: "-",
                bloodSugar: 0,
                urineProtein: await convertUrineProteinValue(0),
            };
        }
    }

    async getFullKiaData(userId: string): Promise<kiaResponse> {
        const kiaData = await getKiaDataByUserId(userId);

        const kiaDataResponse = await this.getKiaData(userId);
        const facilityCheckupResponse = await this.getFacilityCheckupData(userId);
        const physicalCheckupResponse = await this.getPhysicalCheckupData(userId);
        const checklistDataResponse = await this.getChecklistData(userId);
        const labDataResponse = await this.getLabData(userId);
        const progress = await calculateKiaProgress(userId);

        return {
            kiaData: kiaDataResponse,
            checkupData: {
                facility: facilityCheckupResponse,
                physical: physicalCheckupResponse,
            },
            checklistData: checklistDataResponse,
            labData: labDataResponse,
            progress: progress,
            hpht: kiaData.hpht,
        };
    }

    async saveHpht(userId: string, hpht: Date): Promise<boolean> {
        const hpl = calculateHPL(hpht);

        await db
            .update(kia)
            .set({ 
                hpht: hpht, 
                hpl: hpl, 
                trimester: calculateTrimester(await getPregnancyWeeks(userId)) 
            })
            .where(eq(kia.user_id, userId))
            .returning();
        
        return true;
    
    }

    async getCsvReport(userId: string): Promise<string> {
        const kiaData = await getKiaDataByUserId(userId);
        
        const allCheckups = await db
            .select()
            .from(checkup)
            .where(eq(checkup.kia_id, kiaData.id));

        if (!allCheckups || allCheckups.length === 0) {
            throw new AppError("No checkup data found", 404);
        }

        const [checklistData] = await db
            .select()
            .from(checklist)
            .where(eq(checklist.kia_id, kiaData.id))
            .limit(1);

        // Convert boolean to Yes/No for better readability
        const boolToYesNo = (value: boolean): string => value ? "Yes" : "No";

        const flattenedData = allCheckups.map((check) => ({
            checkup_date: check.checkup_date ? new Date(check.checkup_date).toLocaleDateString() : "-",
            facility_name: check.facility_name || "-",
            doctor_name: check.doctor_name || "-",
            blood_pressure: check.blood_pressure || "-",
            weight_kg: check.weight ? Number(check.weight) : "-",
            height_cm: check.height ? Number(check.height) : "-",
            fundal_height_cm: check.fundal_height ? Number(check.fundal_height) : "-",
            lila_mm: check.lila || "-",
            imt: check.weight && check.height ? (Number(check.weight) / (Number(check.height) ** 2)).toFixed(2) : "-",
            hemoglobin_gdl: check.hemoglobin || "-",
            blood_type: check.blood_type || "-",
            blood_sugar_mgdl: check.blood_sugar || "-",
            urine_protein: check.urine_protein || "-",
            fetal_heartbeat: boolToYesNo(checklistData?.fetal_heartbeat || false),
            counseling: boolToYesNo(checklistData?.counseling || false),
            tetanus_immunization: boolToYesNo(checklistData?.tetanus_immunization || false),
            health_screening: boolToYesNo(checklistData?.health_screening || false),
            iron_supplement: boolToYesNo(checklistData?.iron_supplement || false),
            ppia: boolToYesNo(checklistData?.ppia || false),
            checklist_completed: boolToYesNo(checklistData?.is_completed || false),
        }));

        const csvData = stringify(flattenedData, {
            header: true,
            columns: {
                checkup_date: "Checkup Date",
                facility_name: "Facility Name",
                doctor_name: "Doctor Name",
                blood_pressure: "Blood Pressure (mmHg)",
                weight_kg: "Weight (kg)",
                height_cm: "Height (cm)",
                fundal_height_cm: "Fundal Height (cm)",
                lila_mm: "LILA (mm)",
                imt: "BMI (IMT)",
                hemoglobin_gdl: "Hemoglobin (g/dL)",
                blood_type: "Blood Type",
                blood_sugar_mgdl: "Blood Sugar (mg/dL)",
                urine_protein: "Urine Protein",
                fetal_heartbeat: "Fetal Heartbeat Checked",
                counseling: "Counseling Provided",
                tetanus_immunization: "Tetanus Immunization",
                health_screening: "Health Screening",
                iron_supplement: "Iron Supplement",
                ppia: "PPIA Services",
                checklist_completed: "All Services Completed",
            },
        });

        return csvData;
    }

    private drawSectionHeader(doc: any, title: string, y?: number): number {
        const headerY = y || doc.y;
        const pageWidth = doc.page.width;
        const margin = 50;
        const contentWidth = pageWidth - 2 * margin;
        
        // Draw line above
        doc.strokeColor('#1e3a8a').lineWidth(0.5);
        doc.moveTo(margin, headerY).lineTo(pageWidth - margin, headerY).stroke();
        
        // Draw title with background
        doc.fillColor('#1e3a8a').fontSize(13).font('Helvetica-Bold');
        doc.text(title, margin + 10, headerY + 8, { width: contentWidth - 20 });
        
        // Draw line below
        doc.strokeColor('#1e3a8a').lineWidth(0.5);
        doc.moveTo(margin, headerY + 28).lineTo(pageWidth - margin, headerY + 28).stroke();
        
        doc.fillColor('#000000');
        
        return headerY + 38;
    }

    async getPdfReport(userId: string): Promise<Buffer> {
        const kiaData = await getKiaDataByUserId(userId);
        
        const allCheckups = await db
            .select()
            .from(checkup)
            .where(eq(checkup.kia_id, kiaData.id));

        if (!allCheckups || allCheckups.length === 0) {
            throw new AppError("No checkup data found", 404);
        }

        const [checklistData] = await db
            .select()
            .from(checklist)
            .where(eq(checklist.kia_id, kiaData.id))
            .limit(1);

        const doc = new PDFDocument({
            bufferPages: true,
            size: 'A4'
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        const pageWidth = doc.page.width;
        const margin = 50;
        const contentWidth = pageWidth - 2 * margin;

        // ============ PROFESSIONAL HEADER ============
        doc.fillColor('#1e3a8a').rect(0, 0, pageWidth, 100).fill();
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold');
        doc.text('MATERNAL HEALTH CARE REPORT', margin, 20, { width: contentWidth, align: 'center' });
        
        doc.fillColor('#e0e7ff').fontSize(10).font('Helvetica');
        doc.text('KIA (Kartu Ibu Hamil) - Comprehensive Pregnancy Health Record', margin, 50, { width: contentWidth, align: 'center' });
        
        const reportDate = new Date();
        doc.fillColor('#bfdbfe').fontSize(9).font('Helvetica');
        doc.text(`Generated: ${reportDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${reportDate.toLocaleTimeString()}`, margin, 68, { width: contentWidth, align: 'center' });
        
        doc.moveDown(4);

        // ============ PREGNANCY INFORMATION SECTION ============
        let currentY = this.drawSectionHeader(doc, 'PREGNANCY INFORMATION');
        doc.y = currentY;

        const weeks = await getPregnancyWeeks(userId);
        const hpl = new Date(kiaData.hpl);
        const today = new Date();
        const daysUntilDelivery = Math.ceil((hpl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const trimester = calculateTrimester(weeks);

        // Left column info boxes
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a');
        doc.text('Gestational Age', margin, doc.y);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#22c55e');
        doc.text(`${weeks} weeks`, margin + 120, doc.y - 16);
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a');
        doc.text('Trimester', margin, doc.y + 20);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#22c55e');
        doc.text(`Trimester ${trimester}`, margin + 120, doc.y - 16);
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a');
        doc.text('HPHT (First Day of LMP)', margin, doc.y + 20);
        doc.fontSize(11).font('Helvetica').fillColor('#000000');
        doc.text(new Date(kiaData.hpht).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 120, doc.y - 16);
        
        // Right column info boxes
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a');
        doc.text('Expected Delivery Date (EDD)', margin + 250, doc.y - 60);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#f59e0b');
        doc.text(hpl.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 250, doc.y - 16);
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a');
        doc.text('Days Until Delivery', margin + 250, doc.y + 20);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#f59e0b');
        doc.text(`${Math.max(0, daysUntilDelivery)} days`, margin + 250, doc.y - 16);

        doc.moveDown(3.5);

        // ============ CARE SERVICES CHECKLIST ============
        currentY = this.drawSectionHeader(doc, 'CARE SERVICES CHECKLIST');
        doc.y = currentY;

        const checklistItems = [
            { name: 'Fetal Heartbeat Monitoring', completed: checklistData?.fetal_heartbeat || false },
            { name: 'Health Counseling', completed: checklistData?.counseling || false },
            { name: 'Tetanus Immunization', completed: checklistData?.tetanus_immunization || false },
            { name: 'Health Screening', completed: checklistData?.health_screening || false },
            { name: 'Iron Supplementation', completed: checklistData?.iron_supplement || false },
            { name: 'PPIA Services', completed: checklistData?.ppia || false },
        ];

        const completedCount = checklistItems.filter(item => item.completed).length;
        const totalCount = checklistItems.length;

        checklistItems.forEach((item, index) => {
            const checkboxX = margin;
            const checkboxY = doc.y;
            const checkboxSize = 12;

            if (item.completed) {
                doc.fillColor('#22c55e').rect(checkboxX, checkboxY, checkboxSize, checkboxSize).fill();
                doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
                doc.text('✓', checkboxX + 2, checkboxY + 1);
            } else {
                doc.strokeColor('#d1d5db').lineWidth(1.5).rect(checkboxX, checkboxY, checkboxSize, checkboxSize).stroke();
            }

            doc.fillColor('#000000').fontSize(11).font('Helvetica');
            doc.text(item.name, checkboxX + 20, checkboxY + 1);

            if ((index + 1) % 2 === 0) {
                doc.moveDown(1.5);
            }
        });

        // Status bar
        doc.moveDown(1);
        const statusBarY = doc.y;
        const barWidth = contentWidth;
        const barHeight = 15;
        
        doc.strokeColor('#d1d5db').lineWidth(1).rect(margin, statusBarY, barWidth, barHeight).stroke();
        const filledWidth = (completedCount / totalCount) * barWidth;
        doc.fillColor('#22c55e').rect(margin, statusBarY, filledWidth, barHeight).fill();
        
        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
        doc.text(`Progress: ${completedCount}/${totalCount} services completed`, margin + 10, statusBarY + 2);

        doc.moveDown(2);

        // ============ CHECKUP HISTORY TABLE ============
        currentY = this.drawSectionHeader(doc, 'CHECKUP HISTORY');
        doc.y = currentY;

        const tableStartY = doc.y;
        const col1Width = 90;  // Date
        const col2Width = 85;  // Facility
        const col3Width = 75;  // Doctor
        const col4Width = 70;  // BP
        const col5Width = 60;  // Weight
        const col6Width = 60;  // Height
        const col7Width = 75;  // Fundal Height

        const columns = [
            { header: 'Date', width: col1Width, x: margin },
            { header: 'Facility', width: col2Width, x: margin + col1Width },
            { header: 'Doctor', width: col3Width, x: margin + col1Width + col2Width },
            { header: 'Blood Pressure', width: col4Width, x: margin + col1Width + col2Width + col3Width },
            { header: 'Weight (kg)', width: col5Width, x: margin + col1Width + col2Width + col3Width + col4Width },
            { header: 'Height (cm)', width: col6Width, x: margin + col1Width + col2Width + col3Width + col4Width + col5Width },
            { header: 'Fundal Ht (cm)', width: col7Width, x: margin + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width },
        ];

        // Table header
        doc.fillColor('#1e3a8a').fontSize(9).font('Helvetica-Bold');
        const headerRowHeight = 20;
        columns.forEach((col) => {
            doc.text(col.header, col.x, doc.y, { width: col.width, align: 'center' });
        });
        doc.moveDown(1.2);

        // Draw header underline
        doc.strokeColor('#1e3a8a').lineWidth(1.5);
        doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).stroke();
        doc.moveDown(0.3);

        // Table rows with alternating colors
        doc.fillColor('#000000').fontSize(9).font('Helvetica');
        allCheckups.forEach((check, index) => {
            const rowY = doc.y;
            const rowHeight = 18;
            const isAlternate = index % 2 === 0;
            
            // Alternate row background
            if (isAlternate) {
                doc.fillColor('#f3f4f6').rect(margin - 5, rowY - 2, contentWidth + 10, rowHeight).fill();
            }

            doc.fillColor('#000000');
            const dateFmt = check.checkup_date ? new Date(check.checkup_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '-';
            doc.text(dateFmt, columns[0]!.x, rowY, { width: columns[0]!.width, align: 'center' });
            doc.text(check.facility_name || '-', columns[1]!.x, rowY, { width: columns[1]!.width, align: 'center' });
            doc.text(check.doctor_name || '-', columns[2]!.x, rowY, { width: columns[2]!.width, align: 'center' });
            doc.text(check.blood_pressure || '-', columns[3]!.x, rowY, { width: columns[3]!.width, align: 'center' });
            doc.text(check.weight ? check.weight.toString() : '-', columns[4]!.x, rowY, { width: columns[4]!.width, align: 'center' });
            doc.text(check.height ? check.height.toString() : '-', columns[5]!.x, rowY, { width: columns[5]!.width, align: 'center' });
            doc.text(check.fundal_height ? check.fundal_height.toString() : '-', columns[6]!.x, rowY, { width: columns[6]!.width, align: 'center' });

            doc.moveDown(1);
        });

        doc.moveDown(0.5);

        // Get the latest checkup
        const latestCheckup = allCheckups.reduce((latest, current) => {
            const latestDate = new Date(latest.checkup_date).getTime();
            const currentDate = new Date(current.checkup_date).getTime();
            return currentDate > latestDate ? current : latest;
        });

        // ============ LATEST LABORATORY RESULTS ============
        currentY = this.drawSectionHeader(doc, 'LATEST LABORATORY RESULTS');
        doc.y = currentY;

        if (latestCheckup) {
            const labData = [
                { label: 'Hemoglobin', value: latestCheckup.hemoglobin || '-', unit: 'g/dL', normal: '11.0 - 16.0' },
                { label: 'Blood Type', value: latestCheckup.blood_type || '-', unit: '', normal: 'Any' },
                { label: 'Blood Sugar', value: latestCheckup.blood_sugar || '-', unit: 'mg/dL', normal: '< 140' },
                { label: 'Urine Protein', value: latestCheckup.urine_protein ? (latestCheckup.urine_protein === '1' ? 'Negative' : 'Positive') : '-', unit: '', normal: 'Negative' },
            ];

            const boxWidth = (contentWidth - 10) / 2;
            let boxIndex = 0;

            labData.forEach((lab, index) => {
                const colIndex = index % 2;
                const rowIndex = Math.floor(index / 2);
                const boxX = margin + (colIndex * (boxWidth + 10));
                const boxY = doc.y + (rowIndex * 65);

                // Draw box
                doc.strokeColor('#e5e7eb').lineWidth(1).rect(boxX, boxY, boxWidth, 60).stroke();

                // Background
                doc.fillColor('#f9fafb').rect(boxX + 1, boxY + 1, boxWidth - 2, 58).fill();

                // Label
                doc.fillColor('#1e3a8a').fontSize(10).font('Helvetica-Bold');
                doc.text(lab.label, boxX + 10, boxY + 8, { width: boxWidth - 20 });

                // Value
                doc.fillColor('#22c55e').fontSize(14).font('Helvetica-Bold');
                doc.text(lab.value.toString(), boxX + 10, boxY + 25, { width: boxWidth - 20 });

                // Unit
                doc.fillColor('#6b7280').fontSize(9).font('Helvetica');
                if (lab.unit) {
                    doc.text(lab.unit, boxX + 10, boxY + 42);
                }

                // Normal range
                doc.fillColor('#9ca3af').fontSize(8).font('Helvetica');
                doc.text(`Normal: ${lab.normal}`, boxX + 10, boxY + 48, { width: boxWidth - 20 });
            });

            doc.moveDown(3.5);
        }

        // ============ LATEST PHYSICAL MEASUREMENTS ============
        currentY = this.drawSectionHeader(doc, 'LATEST PHYSICAL MEASUREMENTS');
        doc.y = currentY;

        const physicalData = [
            { label: 'Weight', value: latestCheckup?.weight || '-', unit: 'kg' },
            { label: 'Height', value: latestCheckup?.height || '-', unit: 'cm' },
            { label: 'Fundal Height', value: latestCheckup?.fundal_height || '-', unit: 'cm' },
            { label: 'LILA', value: latestCheckup?.lila || '-', unit: 'mm' },
        ];

        const measBoxWidth = (contentWidth - 10) / 2;

        physicalData.forEach((measurement, index) => {
            const colIndex = index % 2;
            const rowIndex = Math.floor(index / 2);
            const measX = margin + (colIndex * (measBoxWidth + 10));
            const measY = doc.y + (rowIndex * 55);

            // Draw measurement box
            doc.strokeColor('#d1d5db').lineWidth(1).rect(measX, measY, measBoxWidth, 50).stroke();
            doc.fillColor('#f3f4f6').rect(measX + 1, measY + 1, measBoxWidth - 2, 48).fill();

            // Label
            doc.fillColor('#1e3a8a').fontSize(11).font('Helvetica-Bold');
            doc.text(measurement.label, measX + 12, measY + 12, { width: measBoxWidth - 24 });

            // Value with unit
            doc.fillColor('#f59e0b').fontSize(16).font('Helvetica-Bold');
            const displayValue = measurement.unit ? `${measurement.value} ${measurement.unit}` : measurement.value.toString();
            doc.text(displayValue, measX + 12, measY + 28, { width: measBoxWidth - 24 });
        });

        doc.moveDown(3);

        // ============ PROFESSIONAL FOOTER ============
        doc.moveDown(1);
        doc.strokeColor('#d1d5db').lineWidth(1);
        doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).stroke();
        
        doc.moveDown(0.5);
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica');
        doc.text('CONFIDENTIALITY NOTICE: This document contains confidential and privileged medical information. Unauthorized disclosure is strictly prohibited and may result in legal action.', margin, doc.y, { width: contentWidth, align: 'left' });

        doc.moveDown(1.5);
        
        // Signature lines
        doc.fontSize(9).font('Helvetica');
        doc.text('Healthcare Provider Signature', margin, doc.y);
        doc.text('Date', margin + 250, doc.y - 16);
        
        doc.moveTo(margin, doc.y + 15).lineTo(margin + 180, doc.y + 15).stroke();
        doc.moveTo(margin + 250, doc.y).lineTo(margin + 380, doc.y).stroke();

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }
}

export const kiaServiceInstance = new kiaService();