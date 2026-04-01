# JagaJanin API Documentation v3

**Base URL:** `http://localhost:{API_PORT}/api/v1`  
**Auth:** Bearer Token (JWT) via `Authorization: Bearer <accessToken>`  
**Content-Type:** `application/json` (kecuali upload avatar: `multipart/form-data`)

---

## Authentication

### POST /auth/register

Daftarkan akun pengguna baru.

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| fullName | string | ✅ | Minimal 2 karakter |
| email | string | ✅ | Format email valid |
| password | string | ✅ | Minimal 6 karakter |
| phoneNumber | string | ✅ | 10–20 karakter |

**Contoh Request**
```json
{
  "fullName": "Siti Rahayu",
  "email": "siti@example.com",
  "password": "rahasia123",
  "phoneNumber": "08123456789"
}
```

**Response 201**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-v4",
    "fullName": "Siti Rahayu",
    "email": "siti@example.com",
    "role": "user"
  }
}
```

**Response 409** — Email sudah terdaftar
```json
{ "success": false, "message": "Email already in use" }
```

---

### POST /auth/login

Login dan dapatkan access token + refresh token.

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |
| password | string | ✅ |

**Response 200**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "uuid-v4",
      "fullName": "Siti Rahayu",
      "email": "siti@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "uuid.hexsecret"
  }
}
```

**Response 401**
```json
{ "success": false, "message": "Invalid credentials" }
```

> `accessToken` berlaku sesuai `JWT_EXPIRATION`. `refreshToken` berlaku **7 hari** dan dirotasi otomatis setiap digunakan.

---

### POST /auth/refresh-token

Perbarui access token. Token lama langsung diinvalidasi (rotation).

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | ✅ |

**Response 200**
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "newuuid.newhexsecret"
  }
}
```

**Response 401**
```json
{ "success": false, "message": "Expired refresh token" }
```

---

### POST /auth/logout

Logout dan hapus semua refresh token aktif milik user.

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200**
```json
{ "success": true, "message": "User logged out successfully" }
```

---

## Forms

### POST /forms/onboarding

Submit form onboarding profil kehamilan. Hanya bisa dilakukan **satu kali** per akun.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| foodPreference | integer | ✅ | ID makanan favorit (FK ke tabel `foods`, min: 1) |
| activityLevel | integer | ✅ | 1 = ringan, 2 = sedang, 3 = berat |
| weeks | integer | ✅ | Usia kehamilan dalam minggu (1–45) |
| height | number | ✅ | Tinggi badan cm (> 0) |
| weight | number | ✅ | Berat badan kg (> 0) |
| age | integer | ✅ | Usia ibu (10–65 tahun) |
| mealPerDay | integer | ✅ | Jumlah makan per hari (1–12) |

**Response 201**
```json
{
  "success": true,
  "message": "Onboarding form submitted successfully",
  "data": {
    "name": "Siti Rahayu",
    "age": 28,
    "trimester": 2,
    "aktivitas": "cukup aktif",
    "calories": 2350,
    "mealRecommendation": {
      "stapleName": "Nasi Putih",
      "stapleQty": 2,
      "sideName": "Ayam Goreng",
      "sideQty": 1,
      "vegetableName": "Bayam",
      "vegetableQty": 1
    }
  }
}
```

**Response 400**
```json
{ "success": false, "message": "Onboarding form already completed" }
```

**Kalori yang dihitung otomatis:**

| Kalkulasi | Rumus |
|-----------|-------|
| BMR | `655 + (9.6 × weight) + (1.8 × height) − (4.7 × age)` |
| Daily Calories | `BMR × activityMultiplier + pregnancyAdjustment` |
| Meal Calories | `dailyCalories ÷ mealPerDay` |

| Activity Level | Multiplier | Label |
|----------------|-----------|-------|
| 1 | 1.375 | jarang olahraga |
| 2 | 1.55 | cukup aktif |
| 3 | 1.725 | sangat aktif |

| Trimester | Minggu | Tambahan Kalori |
|-----------|--------|----------------|
| 1 | 1–13 | +200 kcal |
| 2 | 14–27 | +350 kcal |
| 3 | 28–45 | +500 kcal |

---

## Users

Semua endpoint users memerlukan: **`Authorization: Bearer <accessToken>`**

### GET /users/profile

Ambil profil lengkap user beserta signed URL avatar.

**Response 200**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "fullName": "Siti Rahayu",
    "email": "siti@example.com",
    "phoneNumber": "08123456789",
    "avatarUrl": "https://supabase.../signed-url..."
  }
}
```

> `avatarUrl` adalah signed URL dari Supabase Storage, berlaku **1 jam**.

---

### PATCH /users/profile

Update nama dan/atau email user. Untuk ganti email, wajib sertakan password saat ini.

**Request Body** (minimal 1 field)

| Field | Type | Keterangan |
|-------|------|-----------|
| fullName | string | Min 2 karakter |
| email | string | Format email valid. Wajib sertakan `password` |
| password | string | Password saat ini. Wajib jika `email` diisi |

**Contoh — ganti nama saja**
```json
{ "fullName": "Siti Rahayu Baru" }
```

**Contoh — ganti email**
```json
{
  "email": "siti.baru@example.com",
  "password": "rahasia123"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "Siti Rahayu Baru",
    "email": "siti@example.com",
    "phoneNumber": "08123456789"
  }
}
```

---

### PATCH /users/password

Ganti password user.

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| currentPassword | string | ✅ | Password saat ini |
| newPassword | string | ✅ | Password baru, min 6 karakter |

**Response 200**
```json
{ "success": true, "message": "Password updated successfully" }
```

**Response 400**
```json
{ "success": false, "message": "Invalid current password" }
```

---

### PATCH /users/phone-number

Update nomor telepon user.

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| phoneNumber | string | ✅ | 10–20 karakter |

**Response 200**
```json
{
  "success": true,
  "message": "Phone number updated successfully",
  "data": { "phoneNumber": "08198765432" }
}
```

---

### PATCH /users/preference

Update preferensi makanan (lauk favorit untuk rekomendasi).

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| foodPreference | integer | ✅ | ID makanan valid dari tabel `foods` (min: 1) |

**Response 200**
```json
{ "success": true, "message": "Food preference updated successfully" }
```

**Response 404**
```json
{ "success": false, "message": "Food does not exist" }
```

---

### GET /users/avatar

Ambil signed URL avatar user saat ini.

**Response 200**
```json
{
  "success": true,
  "message": "Avatar URL retrieved successfully",
  "data": { "avatarUrl": "https://supabase.../signed-url..." }
}
```

---

### PATCH /users/avatar

Upload atau ganti foto profil. Avatar lama otomatis dihapus dari storage.

**Content-Type:** `multipart/form-data`

| Field | Type | Keterangan |
|-------|------|-----------|
| file | File | Wajib bertipe `image/*`. Maks **2 MB**. |

**Response 200**
```json
{ "success": true, "message": "Avatar updated successfully" }
```

**Response 400**
```json
{ "success": false, "message": "Invalid file type. Only images are allowed." }
```

---

## Dashboard

Semua endpoint dashboard memerlukan: **`Authorization: Bearer <accessToken>`**  
User harus sudah menyelesaikan onboarding.

---

### GET /dashboard/data

Ringkasan profil kehamilan untuk halaman utama.

**Response 200**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "avatarUrl": "https://supabase.../signed-url...",
    "trimester": 2,
    "weeks": 20
  }
}
```

---

### GET /dashboard/meal-recommendations

Rekomendasi makanan per sesi makan berdasarkan kalori dan preferensi user.

**Response 200**
```json
{
  "success": true,
  "message": "Meal recommendations retrieved successfully",
  "data": {
    "staple": {
      "name": "Nasi Putih",
      "quantity": 2,
      "gram": 400,
      "price": 8000,
      "picture": "https://supabase.../signed-url..."
    },
    "side": {
      "name": "Ayam Goreng",
      "quantity": 1,
      "gram": 100,
      "price": 12000,
      "picture": "https://supabase.../signed-url..."
    },
    "vegetable": {
      "name": "Bayam",
      "quantity": 1,
      "gram": 150,
      "price": 5000,
      "picture": "https://supabase.../signed-url..."
    },
    "totalPrice": 25000
  }
}
```

**Komposisi kalori per meal:**

| Kategori | Porsi Kalori |
|----------|-------------|
| Staple (carbohydrates) | 50% |
| Side (protein, based on preference) | 25% |
| Vegetable | 25% |

> Semua `picture` adalah signed URL Supabase Storage berlaku **1 jam**.

---

### GET /dashboard/daily-progress

Tracking kalori hari ini.

**Response 200**
```json
{
  "success": true,
  "message": "Daily progress retrieved successfully",
  "data": {
    "caloriesConsumed": 1200,
    "caloriesRemaining": 1150,
    "progressPercentage": 51,
    "mealsLogged": 3
  }
}
```

| Field | Keterangan |
|-------|-----------|
| caloriesConsumed | Total kalori dikonsumsi hari ini |
| caloriesRemaining | Sisa kalori (minimum 0) |
| progressPercentage | Persentase pencapaian kalori harian (maksimum 100%) |
| mealsLogged | Jumlah entri meal log hari ini |

---

### GET /dashboard/weekly-progress

Tracking kalori minggu berjalan (Senin–Minggu) beserta daftar makanan per hari.

**Response 200**
```json
{
  "success": true,
  "message": "Weekly progress retrieved successfully",
  "data": {
    "week": [
      {
        "day": "Monday",
        "date": "2025-03-24",
        "calories": 2100,
        "foods": ["Nasi Putih", "Ayam Goreng", "Bayam"]
      },
      {
        "day": "Tuesday",
        "date": "2025-03-25",
        "calories": 1950,
        "foods": ["Nasi Merah", "Tempe"]
      },
      {
        "day": "Wednesday",
        "date": "2025-03-26",
        "calories": 0,
        "foods": []
      }
    ],
    "totalCalories": 4050,
    "dailyCalorieGoal": 2350
  }
}
```

| Field | Keterangan |
|-------|-----------|
| day | Nama hari (Monday–Sunday) |
| date | Tanggal dalam format YYYY-MM-DD |
| calories | Total kalori hari tersebut (0 jika tidak ada log) |
| foods | Daftar unik nama makanan yang dikonsumsi hari itu |
| totalCalories | Total kalori seluruh minggu |
| dailyCalorieGoal | Target kalori harian dari profil kehamilan |

---

## Endpoints Umum

### GET /health

Cek status server dan koneksi database. Tidak memerlukan autentikasi.

**Response 200**
```json
{ "status": "healthy", "database": "connected" }
```

---

## Kode Error Umum

| HTTP Status | Keterangan |
|-------------|-----------|
| 200 | Berhasil |
| 201 | Resource berhasil dibuat |
| 400 | Request tidak valid / logika gagal |
| 401 | Tidak terautentikasi atau token kadaluarsa |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (email sudah digunakan) |
| 500 | Server error internal |

---

## Environment Variables

| Variabel | Keterangan | Wajib |
|----------|-----------|-------|
| `DATABASE_URL` | Connection string PostgreSQL | ✅ |
| `JWT_SECRET` | Secret key untuk signing JWT | ✅ |
| `JWT_EXPIRATION` | Masa berlaku access token (contoh: `15m`, `1h`) | ✅ |
| `API_PORT` | Port server (contoh: `3000`) | ✅ |
| `SUPABASE_URL` | URL project Supabase | ✅ |
| `SUPABASE_KEY` | Anon/Service key Supabase | ✅ |

---

## Catatan Keamanan

- Password di-hash dengan **bcrypt** (salt rounds: 10)
- Refresh token menggunakan format `UUID.hexSecret`, disimpan sebagai bcrypt hash
- Refresh token **dirotasi** setiap digunakan — token lama langsung dihapus
- Semua schema request menggunakan `additionalProperties: false`
- Upload file dibatasi **2 MB** dan hanya tipe `image/*`
- Avatar & gambar makanan disimpan di **Supabase Storage** dengan signed URL (TTL: 1 jam)
