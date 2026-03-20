# JagaJanin API Documentation v2

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

**Contoh Request**
```json
{
  "fullName": "Siti Rahayu",
  "email": "siti@example.com",
  "password": "rahasia123"
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

**Response 500** — Error server
```json
{ "success": false, "message": "An error occurred" }
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

**Response 401** — Kredensial tidak valid
```json
{ "success": false, "message": "Invalid credentials" }
```

> `accessToken` berlaku sesuai `JWT_EXPIRATION`. `refreshToken` berlaku **7 hari** dan dirotasi otomatis.

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

Logout dan hapus semua refresh token user yang aktif.

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200**
```json
{ "success": true, "message": "User logged out successfully" }
```

**Response 401**
```json
{ "success": false, "message": "Unauthorized or expired token" }
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

**Contoh Request**
```json
{
  "foodPreference": 2,
  "activityLevel": 2,
  "weeks": 20,
  "height": 160,
  "weight": 60,
  "age": 28,
  "mealPerDay": 3
}
```

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
      "pokokName": "Nasi Putih",
      "pokokQty": 2,
      "laukName": "Ayam Goreng",
      "laukQty": 1,
      "sayurName": "Bayam",
      "sayurQty": 1
    }
  }
}
```

**Response 400** — Sudah pernah mengisi atau error validasi
```json
{ "success": false, "message": "Onboarding form already completed" }
```

**Kalori yang dihitung otomatis:**

| Kalkulasi | Rumus |
|-----------|-------|
| BMR | `655 + (9.6 × weight) + (1.8 × height) − (4.7 × age)` |
| Daily Calories | `BMR × activityMultiplier + pregnancyAdjustment` |
| Meal Calories | `dailyCalories ÷ mealPerDay` |

**Activity Multiplier:** 1 = 1.375 · 2 = 1.55 · 3 = 1.725

**Pregnancy Adjustment:** Trimester 1 (+200 kcal) · Trimester 2 (+350 kcal) · Trimester 3 (+500 kcal)

---

## Users

Semua endpoint users memerlukan: **`Authorization: Bearer <accessToken>`**

### GET /users/profile

Ambil profil user beserta avatar (jika ada).

**Response 200**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "fullName": "Siti Rahayu",
    "email": "siti@example.com",
    "avatarUrl": "https://supabase.../signed-url..." 
  }
}
```

> `avatarUrl` hanya ada jika user sudah upload avatar. Signed URL berlaku **1 jam**.

---

### PATCH /users/profile

Update nama dan/atau email user. Untuk ganti email, password wajib disertakan.

**Request Body** (minimal 1 field)

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| fullName | string | — | Minimal 2 karakter |
| email | string | — | Format email valid. Wajib sertakan `password` |
| password | string | — | Password saat ini. Wajib jika `email` diisi |

**Contoh Request — ganti nama saja**
```json
{ "fullName": "Siti Rahayu Baru" }
```

**Contoh Request — ganti email (butuh password)**
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
    "email": "siti@example.com"
  }
}
```

**Response 404** — Error validasi atau user tidak ditemukan
```json
{ "success": false, "message": "Password is required to change email" }
```

---

### PATCH /users/password

Ganti password user.

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| currentPassword | string | ✅ | Password saat ini |
| newPassword | string | ✅ | Password baru, minimal 6 karakter |

**Response 200**
```json
{ "success": true, "message": "Password updated successfully" }
```

**Response 400**
```json
{ "success": false, "message": "Invalid current password" }
```

---

### PATCH /users/preference

Update preferensi makanan (lauk favorit).

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| foodPreference | integer | ✅ | ID makanan dari tabel foods (min: 1) |

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
  "data": {
    "avatarUrl": "https://supabase.../signed-url..."
  }
}
```

---

### PATCH /users/avatar

Upload atau ganti foto profil. Avatar lama akan otomatis dihapus dari storage.

**Content-Type:** `multipart/form-data`

| Field | Type | Keterangan |
|-------|------|-----------|
| file | File | Wajib bertipe image/*. Maks 2 MB. |

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
User harus sudah menyelesaikan onboarding sebelum mengakses endpoint ini.

---

### GET /dashboard/data

Ambil data ringkasan profil kehamilan untuk halaman utama.

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

> `avatarUrl` bisa `null` jika belum ada avatar.

---

### GET /dashboard/meal-recommendations

Ambil rekomendasi makanan per sesi makan berdasarkan profil kalori.

**Response 200**
```json
{
  "success": true,
  "message": "Meal recommendations retrieved successfully",
  "data": {
    "price": 25000,
    "pokokGram": 200,
    "laukGram": 100,
    "sayurGram": 150,
    "pokokPrice": 8000,
    "laukPrice": 12000,
    "sayurPrice": 5000,
    "mealrecommendation": {
      "pokokName": "Nasi Putih",
      "pokokQty": 2,
      "laukName": "Ayam Goreng",
      "laukQty": 1,
      "sayurName": "Bayam",
      "sayurQty": 1
    }
  }
}
```

**Komposisi kalori per meal:**
- Pokok (karbohidrat): 50% dari meal calories
- Lauk (protein): 25% dari meal calories  
- Sayur: 25% dari meal calories

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
| caloriesConsumed | Total kalori yang sudah dikonsumsi hari ini |
| caloriesRemaining | Sisa kalori (min 0, tidak negatif) |
| progressPercentage | Persentase pencapaian kalori harian (maks 100%) |
| mealsLogged | Jumlah entri meal log hari ini |

---

### GET /dashboard/weekly-progress

Tracking kalori 7 hari dalam minggu berjalan (Senin–Minggu).

**Response 200**
```json
{
  "success": true,
  "message": "Weekly progress retrieved successfully",
  "data": {
    "week": [
      { "day": "Monday", "calories": 2100 },
      { "day": "Tuesday", "calories": 1950 },
      { "day": "Wednesday", "calories": 2200 },
      { "day": "Thursday", "calories": 0 },
      { "day": "Friday", "calories": 0 },
      { "day": "Saturday", "calories": 0 },
      { "day": "Sunday", "calories": 0 }
    ],
    "totalCalories": 6250
  }
}
```

> Hari yang belum dilalui atau tidak ada log akan bernilai `0`.

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

- Password di-hash menggunakan **bcrypt** (salt rounds: 10)
- Refresh token menggunakan format `UUID.hexSecret`, disimpan sebagai bcrypt hash
- Refresh token **dirotasi** setiap kali digunakan — token lama langsung dihapus
- Semua schema request menggunakan `additionalProperties: false`
- Upload file dibatasi **2 MB** dan hanya tipe `image/*`
- Avatar disimpan di **Supabase Storage** dengan signed URL (TTL: 1 jam)
