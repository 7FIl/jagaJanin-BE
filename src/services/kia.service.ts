import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { checkup, kia, checklist } from "../db/schema.js";
import { calculateTrimester } from "./form.service.js";
import { getPregnancyWeeks } from "./pregnancy.service.js";
import { stringify } from "csv-stringify/sync";
import PDFDocument from "pdfkit";

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
        throw new Error("KIA data not found");
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
        throw new Error("No checkup data found");
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
            throw new Error("At least one field must be provided");
        }

        const [checkupData] = await db
            .update(checkup)
            .set(updateValues)
            .where(eq(checkup.kia_id, kiaData.id))
            .returning();

        if (!checkupData) {
            throw new Error("Failed to update facility checkup data");
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
            throw new Error("At least one field must be provided");
        }

        const [updatedCheckup] = await db
            .update(checkup)
            .set(updateValues)
            .where(eq(checkup.kia_id, kiaData.id))
            .returning();

        if (!updatedCheckup) {
            throw new Error("Failed to update physical checkup data");
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
            throw new Error("At least one field must be provided");
        }

        const [updatedChecklist] = await db
            .update(checklist)
            .set(updateValues)
            .where(eq(checklist.kia_id, kiaData.id))
            .returning();
        
            if (!updatedChecklist) {
            throw new Error("Failed to update checklist data");
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
            throw new Error("At least one field must be provided");
        }

        const [updatedCheckup] = await db
            .update(checkup)
            .set(updateValues)
            .where(eq(checkup.kia_id, kiaData.id))
            .returning();
        
            if (!updatedCheckup) {
            throw new Error("Failed to update lab data");
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
            throw new Error("No checkup data found");
        }

        const [checklistData] = await db
            .select()
            .from(checklist)
            .where(eq(checklist.kia_id, kiaData.id))
            .limit(1);

        const flattenedData = allCheckups.map((check) => ({
            checkup_date: check.checkup_date,
            facility_name: check.facility_name,
            doctor_name: check.doctor_name,
            blood_pressure: check.blood_pressure,
            weight: check.weight,
            height: check.height,
            fundal_height: check.fundal_height,
            lila: check.lila,
            hemoglobin: check.hemoglobin,
            blood_type: check.blood_type,
            blood_sugar: check.blood_sugar,
            urine_protein: check.urine_protein,
            fetal_heartbeat: checklistData?.fetal_heartbeat || false,
            counseling: checklistData?.counseling || false,
            tetanus_immunization: checklistData?.tetanus_immunization || false,
            health_screening: checklistData?.health_screening || false,
            iron_supplement: checklistData?.iron_supplement || false,
            ppia: checklistData?.ppia || false,
            checklist_completed: checklistData?.is_completed || false,
        }));

        const csvData = stringify(flattenedData, {
            header: true,
            columns: {
                checkup_date: "Checkup Date",
                facility_name: "Facility Name",
                doctor_name: "Doctor Name",
                blood_pressure: "Blood Pressure",
                weight: "Weight (kg)",
                height: "Height (cm)",
                fundal_height: "Fundal Height (cm)",
                lila: "LILA (mm)",
                hemoglobin: "Hemoglobin (g/dL)",
                blood_type: "Blood Type",
                blood_sugar: "Blood Sugar (mg/dL)",
                urine_protein: "Urine Protein",
                fetal_heartbeat: "Fetal Heartbeat",
                counseling: "Counseling",
                tetanus_immunization: "Tetanus Immunization",
                health_screening: "Health Screening",
                iron_supplementation: "Iron Supplementation",
                ppia: "PPIA",
                checklist_completed: "Checklist Completed",
            },
        });

        return csvData;
    }

    async getPdfReport(userId: string): Promise<Buffer> {
        const kiaData = await getKiaDataByUserId(userId);
        
        const allCheckups = await db
            .select()
            .from(checkup)
            .where(eq(checkup.kia_id, kiaData.id));

        if (!allCheckups || allCheckups.length === 0) {
            throw new Error("No checkup data found");
        }

        const [checklistData] = await db
            .select()
            .from(checklist)
            .where(eq(checklist.kia_id, kiaData.id))
            .limit(1);

        // Create PDF document
        const doc = new PDFDocument({
            bufferPages: true
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        // Document title and header
        doc.fontSize(20).font('Helvetica-Bold').text('KIA Health Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(1);

        // Summary Section
        doc.fontSize(14).font('Helvetica-Bold').text('Pregnancy Summary');
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Weeks: ${kiaData.trimester ? `Trimester ${kiaData.trimester}` : 'N/A'}`);
        doc.text(`HPL (Estimated Due Date): ${kiaData.hpl ? new Date(kiaData.hpl).toLocaleDateString() : 'N/A'}`);
        doc.text(`HPHT (First Day Last Menstruation): ${kiaData.hpht ? new Date(kiaData.hpht).toLocaleDateString() : 'N/A'}`);
        doc.moveDown(0.5);

        // Checklist Section
        doc.fontSize(14).font('Helvetica-Bold').text('Health Checklist');
        doc.moveDown(0.3);
        if (checklistData) {
            const checklistItems = [];
            if (checklistData.fetal_heartbeat) checklistItems.push('✓ Fetal Heartbeat');
            if (checklistData.counseling) checklistItems.push('✓ Counseling');
            if (checklistData.tetanus_immunization) checklistItems.push('✓ Tetanus Immunization');
            if (checklistData.health_screening) checklistItems.push('✓ Health Screening');
            if (checklistData.iron_supplement) checklistItems.push('✓ Iron Supplement');
            if (checklistData.ppia) checklistItems.push('✓ PPIA');
            
            doc.fontSize(11).font('Helvetica');
            checklistItems.forEach(item => doc.text(item));
            doc.text(`Status: ${checklistData.is_completed ? 'Completed' : 'In Progress'}`);
        }
        doc.moveDown(1);

        // Checkups Section
        doc.fontSize(14).font('Helvetica-Bold').text('Checkup Records');
        doc.moveDown(0.5);

        // Table header
        const startX = 50;
        const col1X = startX;
        const col2X = startX + 100;
        const col3X = startX + 200;
        const col4X = startX + 280;
        const col5X = startX + 360;
        const rowHeight = 20;
        const headerY = doc.y;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', col1X, headerY);
        doc.text('Facility', col2X, headerY);
        doc.text('Doctor', col3X, headerY);
        doc.text('Weight', col4X, headerY);
        doc.text('BP', col5X, headerY);

        doc.moveTo(startX, headerY + 15).lineTo(550, headerY + 15).stroke();
        doc.moveDown(1);

        // Table rows
        doc.fontSize(9).font('Helvetica');
        allCheckups.forEach((check) => {
            const currentY = doc.y;
            const dateFmt = check.checkup_date ? new Date(check.checkup_date).toLocaleDateString() : 'N/A';
            const weight = check.weight ? `${check.weight} kg` : 'N/A';
            const bp = check.blood_pressure || 'N/A';

            doc.text(dateFmt, col1X, currentY, { width: 90 });
            doc.text(check.facility_name || '-', col2X, currentY, { width: 90 });
            doc.text(check.doctor_name || '-', col3X, currentY, { width: 70 });
            doc.text(weight, col4X, currentY, { width: 70 });
            doc.text(bp, col5X, currentY, { width: 50 });

            doc.moveDown(1);
        });

        doc.moveDown(0.5);

        // Lab Results Section
        doc.fontSize(14).font('Helvetica-Bold').text('Latest Lab Results');
        doc.moveDown(0.3);
        if (allCheckups.length > 0) {
            const latestCheckup = allCheckups[0];
            doc.fontSize(11).font('Helvetica');
            doc.text(`Hemoglobin: ${latestCheckup!.hemoglobin} g/dL`);
            doc.text(`Blood Type: ${latestCheckup!.blood_type}`);
            doc.text(`Blood Sugar: ${latestCheckup!.blood_sugar} mg/dL`);
            doc.text(`Urine Protein: ${latestCheckup!.urine_protein}`);
            doc.text(`Fundal Height: ${latestCheckup!.fundal_height} cm`);
            doc.text(`LILA: ${latestCheckup!.lila} mm`);
        }

        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica').text('This report is generated for medical reference purposes only.', { align: 'center' });

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