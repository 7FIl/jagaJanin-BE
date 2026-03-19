# JagaJanin API Documentation

**Base URL:** `http://localhost:{API_PORT}/api/v1`  
**Auth:** Bearer Token (JWT) via `Authorization: Bearer <accessToken>`  
**Format:** JSON

---

## Authentication

### POST /auth/register

Register akun pengguna baru.

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| fullName | string | ✅ | Minimal 2 karakter |
| email | string (email) | ✅ | Format email valid |
| password | string | ✅ | Minimal 6 karakter |

**Contoh Request**
```json
{
  "fullName": "Siti Rahayu",
  "email": "siti@example.com",
  "password": "rahasia123"
}
```

**Response 201 — Berhasil**
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

**Response 409 — Email sudah terdaftar**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

### POST /auth/login

Login dan dapatkan access token + refresh token.

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| email | string (email) | ✅ |
| password | string | ✅ |

**Contoh Request**
```json
{
  "email": "siti@example.com",
  "password": "rahasia123"
}
```

**Response 200 — Berhasil**
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

**Response 401 — Kredensial salah**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

> **Catatan:** `accessToken` berlaku sesuai `JWT_EXPIRATION` di `.env`. `refreshToken` berlaku 7 hari.

---

### POST /auth/refresh-token

Perbarui access token menggunakan refresh token (token lama akan diinvalidasi).

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | ✅ |

**Contoh Request**
```json
{
  "refreshToken": "uuid.hexsecret"
}
```

**Response 200 — Berhasil**
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

**Response 401 — Token tidak valid atau kadaluarsa**
```json
{
  "success": false,
  "message": "Expired refresh token"
}
```

---

### POST /auth/logout

Logout dan invalidasi semua refresh token milik user.

**Headers**

```
Authorization: Bearer <accessToken>
```

**Response 200 — Berhasil**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

**Response 401 — Token tidak valid**
```json
{
  "success": false,
  "message": "Unauthorized or expired token"
}
```

---

## Forms (Onboarding)

### POST /forms/onboarding

Submit form onboarding profil kehamilan. Hanya bisa dilakukan satu kali per user.

**Headers**

```
Authorization: Bearer <accessToken>
```

**Request Body**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| foodPreference | integer | ✅ | ID makanan yang disukai (referensi ke tabel `foods`) |
| activityLevel | integer | ✅ | Level aktivitas: `1` = ringan, `2` = sedang, `3` = berat |
| weeks | integer | ✅ | Usia kehamilan dalam minggu (1–45) |
| height | number | ✅ | Tinggi badan dalam cm (> 0) |
| weight | number | ✅ | Berat badan dalam kg (> 0) |
| age | integer | ✅ | Usia ibu dalam tahun (10–65) |
| mealPerDay | integer | ✅ | Jumlah makan per hari (1–12) |

**Contoh Request**
```json
{
  "foodPreference": 1,
  "activityLevel": 2,
  "weeks": 20,
  "height": 160,
  "weight": 60,
  "age": 28,
  "mealPerDay": 3
}
```

**Response 201 — Berhasil**
```json
{
  "success": true,
  "message": "Onboarding form submitted successfully",
  "data": {
    "completed": true
  }
}
```

**Response 400 — Onboarding sudah diselesaikan**
```json
{
  "success": false,
  "message": "Onboarding form already completed"
}
```

**Response 401 — Tidak terautentikasi**
```json
{
  "success": false,
  "message": "Unauthorized or expired token"
}
```

**Kalori yang dihitung otomatis:**

| Field | Rumus |
|-------|-------|
| BMR | `655 + (9.6 × weight) + (1.8 × height) - (4.7 × age)` (Mifflin-Harris) |
| Daily calories | `BMR × activityMultiplier + pregnancyAdjustment` |
| Meal calories | `dailyCalories / mealPerDay` |

**Pregnancy calorie adjustment berdasarkan trimester:**

| Minggu | Tambahan kalori |
|--------|----------------|
| 1–13 (Trimester 1) | +200 kcal |
| 14–27 (Trimester 2) | +350 kcal |
| 28–45 (Trimester 3) | +500 kcal |

---

## Endpoints Lainnya

### GET /health

Cek status server dan koneksi database. Tidak memerlukan autentikasi.

**Response 200**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

atau

```json
{
  "status": "unhealthy",
  "database": "disconnected"
}
```

---

### GET /v1/

Root endpoint sederhana.

**Response 200**
```json
{
  "success": "true"
}
```

---

## Kode Error Umum

| HTTP Status | Keterangan |
|-------------|-----------|
| 200 | Berhasil |
| 201 | Resource berhasil dibuat |
| 400 | Request tidak valid / logika gagal |
| 401 | Tidak terautentikasi atau token kadaluarsa |
| 409 | Konflik data (misal email sudah terdaftar) |
| 500 | Server error internal |

---

## Environment Variables

| Variabel | Keterangan | Wajib |
|----------|-----------|-------|
| `DATABASE_URL` | Connection string PostgreSQL | ✅ |
| `JWT_SECRET` | Secret key untuk signing JWT | ✅ |
| `JWT_EXPIRATION` | Masa berlaku access token (contoh: `15m`, `1h`) | ✅ |
| `API_PORT` | Port server berjalan | ✅ |

---

## Catatan Keamanan

- Semua password di-hash menggunakan **bcrypt** (salt rounds: 10)
- Refresh token menggunakan format `UUID.hexSecret`, disimpan dalam bentuk bcrypt hash
- Refresh token **dirotasi** setiap kali digunakan (token lama langsung dihapus)
- Akses ke endpoint protected memerlukan JWT yang valid di header `Authorization`
