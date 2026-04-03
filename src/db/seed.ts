import { db } from "./index.js";
import { 
  users, 
  serving, 
  foods, 
  meal_log, 
  pregnancy_profile, 
  refresh_tokens, 
  otp, 
  kia, 
  checkup, 
  checklist,
  payment,
  doctor_profile,
  ratings,
  consultation,
  practice_schedule
} from "./schema.js";
import bcrypt from "bcrypt";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // ==================== CLEAR EXISTING DATA ====================
    // Clear tables in reverse order of foreign key dependencies
    console.log("🗑️ Clearing existing data...");
    try {
      await db.delete(consultation);
      await db.delete(ratings);
      await db.delete(payment);
      await db.delete(practice_schedule);
      await db.delete(doctor_profile);
      await db.delete(checklist);
      await db.delete(checkup);
      await db.delete(kia);
      await db.delete(meal_log);
      await db.delete(pregnancy_profile);
      await db.delete(refresh_tokens);
      await db.delete(otp);
      await db.delete(users);
      await db.delete(foods);
      await db.delete(serving);
      
      // Reset sequences for serial columns
      await db.execute(`ALTER SEQUENCE serving_id_seq RESTART WITH 1`);
      await db.execute(`ALTER SEQUENCE foods_id_seq RESTART WITH 1`);
      
      console.log("✓ Existing data cleared");
    } catch (error) {
      console.log("⚠️ Warning: Could not clear existing data (may be first run)");
    }

    // ==================== USERS ====================
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Pregnant users
    const pregnantUser1 = await db
      .insert(users)
      .values({
        full_name: "Siti Aminah",
        email: "siti.aminah@email.com",
        password: hashedPassword,
        phone_number: "081234567890",
        role: "user",
        avatar_url: "avatar/siti.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    const pregnantUser2 = await db
      .insert(users)
      .values({
        full_name: "Ratna Dewi",
        email: "ratna.dewi@email.com",
        password: hashedPassword,
        phone_number: "082345678901",
        role: "user",
        avatar_url: "avatar/ratna.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    const pregnantUser3 = await db
      .insert(users)
      .values({
        full_name: "Dewi Lestari",
        email: "dewi.lestari@email.com",
        password: hashedPassword,
        phone_number: "083456789012",
        role: "user",
        avatar_url: "avatar/dewi.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    // Regular users (non-pregnant)
    const regularUser1 = await db
      .insert(users)
      .values({
        full_name: "Eka Prasetyo",
        email: "eka.prasetyo@email.com",
        password: hashedPassword,
        phone_number: "084567890123",
        role: "user",
        avatar_url: "avatar/eka.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    const regularUser2 = await db
      .insert(users)
      .values({
        full_name: "Budi Santoso",
        email: "budi.santoso@email.com",
        password: hashedPassword,
        phone_number: "085678901234",
        role: "user",
        avatar_url: "avatar/budi.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    // Unverified users
    const unverifiedUser = await db
      .insert(users)
      .values({
        full_name: "Citra Kusuma",
        email: "citra.kusuma@email.com",
        password: hashedPassword,
        phone_number: "086789012345",
        role: "user",
        avatar_url: "avatar/citra.png",
        complete_onboarding: false,
        is_verified: false,
      })
      .returning();

    // ==================== DOCTORS ====================
    const doctor1 = await db
      .insert(users)
      .values({
        full_name: "Dr. Budi Hartono, Sp.OG",
        email: "dr.budi@hospital.com",
        password: hashedPassword,
        phone_number: "081111111111",
        role: "doctor",
        avatar_url: "avatar/dr-budi.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    const doctor2 = await db
      .insert(users)
      .values({
        full_name: "Dr. Siti Rahmawati, Sp.OG",
        email: "dr.siti@hospital.com",
        password: hashedPassword,
        phone_number: "082222222222",
        role: "doctor",
        avatar_url: "avatar/dr-siti.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    const doctor3 = await db
      .insert(users)
      .values({
        full_name: "Dr. Hendra Wijaya, Sp.OG",
        email: "dr.hendra@hospital.com",
        password: hashedPassword,
        phone_number: "083333333333",
        role: "doctor",
        avatar_url: "avatar/dr-hendra.png",
        complete_onboarding: true,
        is_verified: true,
      })
      .returning();

    console.log("✓ Users created");

    // ==================== SERVING & FOODS ====================
    // Insert serving sizes
    await db.insert(serving).values([
      {
        id: 1,
        description: "centong sedang",
        gram: 100,
        calories: 130,
        fat: "0.30",
        protein: "3.00",
        price: 1500,
      },
      {
        id: 2,
        description: "potong sedang",
        gram: 50,
        calories: 125,
        fat: "7.00",
        protein: "14.00",
        price: 12000,
      },
      {
        id: 3,
        description: "potong sedang",
        gram: 50,
        calories: 85,
        fat: "4.50",
        protein: "13.50",
        price: 5000,
      },
      {
        id: 4,
        description: "potong sedang",
        gram: 50,
        calories: 40,
        fat: "2.50",
        protein: "4.00",
        price: 500,
      },
      {
        id: 5,
        description: "potong sedang",
        gram: 50,
        calories: 95,
        fat: "4.00",
        protein: "9.00",
        price: 500,
      },
      {
        id: 6,
        description: "ekor",
        gram: 50,
        calories: 50,
        fat: "1.50",
        protein: "9.00",
        price: 5000,
      },
      {
        id: 7,
        description: "butir",
        gram: 55,
        calories: 75,
        fat: "5.00",
        protein: "7.00",
        price: 1500,
      },
      {
        id: 8,
        description: "sendok sayur",
        gram: 40,
        calories: 45,
        fat: "3.00",
        protein: "1.00",
        price: 500,
      },
    ]);

    console.log("✓ Serving data created");

    // Insert foods
    await db.insert(foods).values([
      {
        id: 1,
        serving_id: 1,
        category: 1,
        name: "Nasi Putih",
        picture_url: "food/nasi.png",
      },
      {
        id: 2,
        serving_id: 2,
        category: 2,
        name: "Daging (Sapi)",
        picture_url: "food/sapi.png",
      },
      {
        id: 3,
        serving_id: 3,
        category: 2,
        name: "Ayam (Dada)",
        picture_url: "food/ayam.png",
      },
      {
        id: 4,
        serving_id: 4,
        category: 2,
        name: "Tahu",
        picture_url: "food/tahu.png",
      },
      {
        id: 5,
        serving_id: 5,
        category: 2,
        name: "Tempe",
        picture_url: "food/tempe.png",
      },
      {
        id: 6,
        serving_id: 6,
        category: 2,
        name: "Ikan",
        picture_url: "food/ikan.png",
      },
      {
        id: 7,
        serving_id: 7,
        category: 2,
        name: "Telur Ayam",
        picture_url: "food/telur.png",
      },
      {
        id: 8,
        serving_id: 8,
        category: 3,
        name: "Hidangan Sayur Tumis",
        picture_url: "food/sayur.png",
      },
    ]);

    console.log("✓ Foods created");

    // ==================== DOCTOR PROFILES ====================
    const doctorProfile1 = await db
      .insert(doctor_profile)
      .values({
        user_id: doctor1[0]!.id,
        specialization: "Obstetri dan Ginekologi",
        work_place: "RS Central Jakarta",
        experience_years: 15,
        rating: "4.80",
        cumulative_patients: 850,
        about: "Spesialis kandungan dengan pengalaman lebih dari 15 tahun menangani kehamilan berisiko tinggi.",
        consultation_fee: 150000,
      })
      .returning();

    const doctorProfile2 = await db
      .insert(doctor_profile)
      .values({
        user_id: doctor2[0]!.id,
        specialization: "Obstetri dan Ginekologi",
        work_place: "RS Metropolitan",
        experience_years: 12,
        rating: "4.70",
        cumulative_patients: 620,
        about: "Dokter kandungan yang berpengalaman dalam penanganan kehamilan normal dan risiko tinggi.",
        consultation_fee: 130000,
      })
      .returning();

    const doctorProfile3 = await db
      .insert(doctor_profile)
      .values({
        user_id: doctor3[0]!.id,
        specialization: "Obstetri dan Ginekologi",
        work_place: "Klinik Kesehatan Ibu Hamil",
        experience_years: 8,
        rating: "4.50",
        cumulative_patients: 420,
        about: "Dokter kandungan muda yang fokus pada edukasi kesehatan ibu hamil.",
        consultation_fee: 100000,
      })
      .returning();

    console.log("✓ Doctor profiles created");

    // ==================== PRACTICE SCHEDULES ====================
    // Doctor 1: Senin-Jumat, Pagi (08:00-12:00), Sore (13:00-17:00)
    for (let day = 1; day <= 5; day++) {
      await db.insert(practice_schedule).values([
        {
          doctor_id: doctorProfile1[0]!.id,
          day_start: day,
          day_end: day,
          start_time: "08:00",
          end_time: "12:00",
          session: "pagi",
        },
        {
          doctor_id: doctorProfile1[0]!.id,
          day_start: day,
          day_end: day,
          start_time: "13:00",
          end_time: "17:00",
          session: "sore",
        },
      ]);
    }

    // Doctor 2: Selasa-Sabtu, Pagi (09:00-13:00)
    for (let day = 2; day <= 6; day++) {
      await db.insert(practice_schedule).values({
        doctor_id: doctorProfile2[0]!.id,
        day_start: day,
        day_end: day,
        start_time: "09:00",
        end_time: "13:00",
        session: "pagi",
      });
    }

    // Doctor 3: Rabu-Minggu, Sore (14:00-18:00)
    for (let day = 3; day <= 7; day++) {
      const dayOfWeek = day > 7 ? day - 7 : day;
      await db.insert(practice_schedule).values({
        doctor_id: doctorProfile3[0]!.id,
        day_start: dayOfWeek,
        day_end: dayOfWeek,
        start_time: "14:00",
        end_time: "18:00",
        session: "sore",
      });
    }

    console.log("✓ Practice schedules created");

    // ==================== REFRESH TOKENS ====================
    await db.insert(refresh_tokens).values([
      {
        user_id: pregnantUser1[0]!.id,
        token: "refresh_token_pregnant_user_1",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: pregnantUser2[0]!.id,
        token: "refresh_token_pregnant_user_2",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: regularUser1[0]!.id,
        token: "refresh_token_regular_user_1",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("✓ Refresh tokens created");

    // ==================== OTP ====================
    await db.insert(otp).values({
      email: "test.otp@email.com",
      code: "123456",
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });

    console.log("✓ OTP created");

    // ==================== KIA & CHECKUP & CHECKLIST ====================
    // KIA for pregnant users
    const kia1 = await db
      .insert(kia)
      .values({
        user_id: pregnantUser1[0]!.id,
        trimester: 2,
        hpl: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        hpht: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
      })
      .returning();

    const kia2 = await db
      .insert(kia)
      .values({
        user_id: pregnantUser2[0]!.id,
        trimester: 1,
        hpl: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        hpht: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      })
      .returning();

    const kia3 = await db
      .insert(kia)
      .values({
        user_id: pregnantUser3[0]!.id,
        trimester: 3,
        hpl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        hpht: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000),
      })
      .returning();

    console.log("✓ KIA created");

    // Checkups for each KIA
    await db.insert(checkup).values([
      {
        kia_id: kia1[0]!.id,
        facility_name: "RS Central Jakarta",
        doctor_name: "Dr. Budi Hartono",
        blood_pressure: "120/80",
        weight: "62.50",
        height: "160.00",
        fundal_height: "28.00",
        lila: 27,
        blood_type: "O+",
        hemoglobin: "12.50",
        blood_sugar: 95,
        urine_protein: "Negative",
        checkup_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        kia_id: kia1[0]!.id,
        facility_name: "RS Central Jakarta",
        doctor_name: "Dr. Budi Hartono",
        blood_pressure: "115/75",
        weight: "63.00",
        height: "160.00",
        fundal_height: "30.00",
        lila: 27,
        blood_type: "O+",
        hemoglobin: "12.80",
        blood_sugar: 98,
        urine_protein: "Negative",
        checkup_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        kia_id: kia2[0]!.id,
        facility_name: "RS Metropolitan",
        doctor_name: "Dr. Siti Rahmawati",
        blood_pressure: "118/76",
        weight: "58.00",
        height: "165.00",
        fundal_height: "10.00",
        lila: 26,
        blood_type: "A+",
        hemoglobin: "13.20",
        blood_sugar: 92,
        urine_protein: "Negative",
        checkup_date: new Date(),
      },
      {
        kia_id: kia3[0]!.id,
        facility_name: "Klinik Kesehatan Ibu Hamil",
        doctor_name: "Dr. Hendra Wijaya",
        blood_pressure: "125/82",
        weight: "71.00",
        height: "158.00",
        fundal_height: "35.00",
        lila: 29,
        blood_type: "B+",
        hemoglobin: "11.80",
        blood_sugar: 105,
        urine_protein: "Negative",
        checkup_date: new Date(),
      },
    ]);

    console.log("✓ Checkups created");

    // Checklists for each KIA
    await db.insert(checklist).values([
      {
        kia_id: kia1[0]!.id,
        fetal_heartbeat: true,
        counseling: true,
        tetanus_immunization: true,
        health_screening: true,
        iron_supplement: true,
        ppia: false,
        is_completed: true,
      },
      {
        kia_id: kia2[0]!.id,
        fetal_heartbeat: true,
        counseling: true,
        tetanus_immunization: false,
        health_screening: true,
        iron_supplement: true,
        ppia: false,
        is_completed: false,
      },
      {
        kia_id: kia3[0]!.id,
        fetal_heartbeat: true,
        counseling: true,
        tetanus_immunization: true,
        health_screening: true,
        iron_supplement: true,
        ppia: true,
        is_completed: true,
      },
    ]);

    console.log("✓ Checklists created");

    // ==================== PREGNANCY PROFILES ====================
    await db.insert(pregnancy_profile).values([
      {
        user_id: pregnantUser1[0]!.id,
        food_preference: 1, // Nasi Putih
        activity_level: 2,
        initial_weeks: 24,
        height: "160.00",
        weight: "62.50",
        age: 28,
        meal_per_day: 3,
        bmr: 1450,
        daily_calories: 2500,
        meal_calories: 833,
      },
      {
        user_id: pregnantUser2[0]!.id,
        food_preference: 3, // Ayam
        activity_level: 2,
        initial_weeks: 8,
        height: "165.00",
        weight: "58.00",
        age: 26,
        meal_per_day: 3,
        bmr: 1380,
        daily_calories: 2400,
        meal_calories: 800,
      },
      {
        user_id: pregnantUser3[0]!.id,
        food_preference: 7, // Telur Ayam
        activity_level: 1,
        initial_weeks: 32,
        height: "158.00",
        weight: "71.00",
        age: 31,
        meal_per_day: 5,
        bmr: 1520,
        daily_calories: 2600,
        meal_calories: 520,
      },
    ]);

    console.log("✓ Pregnancy profiles created");

    // ==================== MEAL LOGS ====================
    const mealEntries = [];
    const foodIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    
    // Create meal logs for the last 30 days for pregnant users
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      // Pregnant user 1 - 3 meals per day
      for (let mealIndex = 0; mealIndex < 3; mealIndex++) {
        const randomFood = foodIds[Math.floor(Math.random() * foodIds.length)]!;
        mealEntries.push({
          user_id: pregnantUser1[0]!.id,
          food_id: randomFood,
          quantity: Math.floor(Math.random() * 3) + 1,
          created_at: new Date(date.getTime() + mealIndex * 6 * 60 * 60 * 1000),
          updated_at: new Date(date.getTime() + mealIndex * 6 * 60 * 60 * 1000),
        });
      }

      // Pregnant user 2 - 2-3 meals per day
      for (let mealIndex = 0; mealIndex < 2; mealIndex++) {
        const randomFood = foodIds[Math.floor(Math.random() * foodIds.length)]!;
        mealEntries.push({
          user_id: pregnantUser2[0]!.id,
          food_id: randomFood,
          quantity: Math.floor(Math.random() * 2) + 1,
          created_at: new Date(date.getTime() + mealIndex * 8 * 60 * 60 * 1000),
          updated_at: new Date(date.getTime() + mealIndex * 8 * 60 * 60 * 1000),
        });
      }

      // Regular user 1 - 2 meals per day
      for (let mealIndex = 0; mealIndex < 2; mealIndex++) {
        const randomFood = foodIds[Math.floor(Math.random() * foodIds.length)]!;
        mealEntries.push({
          user_id: regularUser1[0]!.id,
          food_id: randomFood,
          quantity: Math.floor(Math.random() * 2) + 1,
          created_at: new Date(date.getTime() + mealIndex * 12 * 60 * 60 * 1000),
          updated_at: new Date(date.getTime() + mealIndex * 12 * 60 * 60 * 1000),
        });
      }
    }

    // Batch insert meal logs
    if (mealEntries.length > 0) {
      await db.insert(meal_log).values(mealEntries);
    }

    console.log("✓ Meal logs created (30+ days of data)");

    // ==================== CONSULTATIONS ====================
    const consultationEntries = [];

    // Consultation 1: Pregnant user 1 with Doctor 1
    const consultation1 = {
      doctor_id: doctorProfile1[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: true,
      is_done_rating: true,
      is_paid: true,
    };

    // Consultation 2: Pregnant user 2 with Doctor 2
    const consultation2 = {
      doctor_id: doctorProfile2[0]!.id,
      user_id: pregnantUser2[0]!.id,
      start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: true,
      is_done_rating: false,
      is_paid: true,
    };

    // Consultation 3: Pregnant user 3 with Doctor 3
    const consultation3 = {
      doctor_id: doctorProfile3[0]!.id,
      user_id: pregnantUser3[0]!.id,
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: false,
      is_done_rating: false,
      is_paid: false,
    };

    // Consultation 4: Pregnant user 1 with Doctor 2 (upcoming)
    const consultation4 = {
      doctor_id: doctorProfile2[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: false,
      is_done_rating: false,
      is_paid: false,
    };

    // Consultation 5: Regular user 1 with Doctor 1
    const consultation5 = {
      doctor_id: doctorProfile1[0]!.id,
      user_id: regularUser1[0]!.id,
      start_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: true,
      is_done_rating: true,
      is_paid: true,
    };

    // Additional future consultations for pregnantUser1 to test pagination
    const consultation6 = {
      doctor_id: doctorProfile3[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: false,
      is_done_rating: false,
      is_paid: false,
    };

    const consultation7 = {
      doctor_id: doctorProfile1[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: false,
      is_done_rating: false,
      is_paid: false,
    };

    const consultation8 = {
      doctor_id: doctorProfile2[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: false,
      is_done_rating: false,
      is_paid: false,
    };

    // Past consultations for pregnantUser1 to test history pagination
    const consultation9 = {
      doctor_id: doctorProfile3[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: true,
      is_done_rating: true,
      is_paid: true,
    };

    const consultation10 = {
      doctor_id: doctorProfile1[0]!.id,
      user_id: pregnantUser1[0]!.id,
      start_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      is_done: true,
      is_done_rating: false,
      is_paid: true,
    };

    const consultations = await db
      .insert(consultation)
      .values([consultation1, consultation2, consultation3, consultation4, consultation5, consultation6, consultation7, consultation8, consultation9, consultation10])
      .returning();

    console.log("✓ Consultations created");

    // ==================== RATINGS ====================
    await db.insert(ratings).values([
      {
        doctor_id: doctorProfile1[0]!.id,
        user_id: pregnantUser1[0]!.id,
        rating: 5,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        doctor_id: doctorProfile2[0]!.id,
        user_id: pregnantUser2[0]!.id,
        rating: 4,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        doctor_id: doctorProfile1[0]!.id,
        user_id: regularUser1[0]!.id,
        rating: 5,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        doctor_id: doctorProfile3[0]!.id,
        user_id: pregnantUser1[0]!.id,
        rating: 3,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        doctor_id: doctorProfile1[0]!.id,
        user_id: pregnantUser1[0]!.id,
        rating: 4,
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        doctor_id: doctorProfile3[0]!.id,
        user_id: pregnantUser1[0]!.id,
        rating: 5,
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("✓ Ratings created");

    // ==================== PAYMENTS ====================
    await db.insert(payment).values([
      {
        user_id: pregnantUser1[0]!.id,
        amount: 150000,
        status: "paid",
        external_id: "xendit_inv_pregnant_user_1",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: pregnantUser2[0]!.id,
        amount: 130000,
        status: "paid",
        external_id: "xendit_inv_pregnant_user_2",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: pregnantUser3[0]!.id,
        amount: 100000,
        status: "pending",
        external_id: "xendit_inv_pregnant_user_3",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: regularUser1[0]!.id,
        amount: 150000,
        status: "paid",
        external_id: "xendit_inv_regular_user_1",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: regularUser1[0]!.id,
        amount: 100000,
        status: "expired",
        external_id: "xendit_inv_regular_user_1_expired",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: pregnantUser1[0]!.id,
        amount: 130000,
        status: "paid",
        external_id: "xendit_inv_pregnant_user_1_cons10",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: pregnantUser1[0]!.id,
        amount: 100000,
        status: "pending",
        external_id: "xendit_inv_pregnant_user_1_cons6",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: pregnantUser1[0]!.id,
        amount: 150000,
        status: "pending",
        external_id: "xendit_inv_pregnant_user_1_cons7",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("✓ Payments created");

    console.log("🎉 Database seeded successfully!");
    console.log("\n📊 Summary of seeded data:");
    console.log("  - Users: 6 (3 pregnant, 2 regular, 1 unverified)");
    console.log("  - Doctors: 3");
    console.log("  - Doctor Profiles: 3");
    console.log("  - Practice Schedules: 13");
    console.log("  - Serving Sizes: 8");
    console.log("  - Foods: 8");
    console.log("  - Refresh Tokens: 3");
    console.log("  - OTP: 1");
    console.log("  - KIA: 3");
    console.log("  - Checkups: 4");
    console.log("  - Checklists: 3");
    console.log("  - Pregnancy Profiles: 3");
    console.log("  - Meal Logs: 180+ (30 days of data)");
    console.log("  - Consultations: 10 (5 past, 5 future/upcoming)");
    console.log("  - Ratings: 6");
    console.log("  - Payments: 8");
    console.log("\n💡 Test data ready! Use these credentials:");
    console.log("  - Email: siti.aminah@email.com");
    console.log("  - Password: password123");
    console.log("  - Has 4 future consultations for pagination testing");
  } catch (error) {
    console.error("❌ Database seed failed:", error);
    process.exit(1);
  }
}

seedDatabase();
