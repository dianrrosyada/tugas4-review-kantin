# Review Kantin – Tugas 4: Frontend React & Integrasi Backend

Aplikasi web untuk melihat dan mengelola warung kantin. Frontend **React (TypeScript)** berkomunikasi
dengan backend **Express.js + SQL Server** (Tugas 2 dan Tugas 3) memakai **Axios**.

## Teknologi

| Bagian   | Teknologi |
|----------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, lucide-react |
| HTTP     | **Axios** (satu-satunya metode komunikasi HTTP; tidak memakai Fetch API) |
| Backend  | Express 5, Drizzle ORM, SQL Server, zod, JWT, bcrypt (dari Tugas 3) |

## Struktur repository

```
backend/     Backend Tugas 2 + 3 (ditambah CORS untuk frontend)
frontend/    Frontend React (Tugas 4)
```

Struktur `frontend/src` mengikuti praktikum pertemuan 7:

```
components/  Komponen UI (header, kartu, filter, pagination, state panel, dialog, form field, route guard)
context/     AuthProvider (sesi login) dan ToastProvider (notifikasi)
hooks/       useStalls, useStall, useAuth, useToast
lib/         api.ts (Axios), auth-storage.ts, permissions.ts, validation.ts, query.ts, format.ts, ui.ts
pages/       Daftar warung, detail, form tambah/ubah, login, registrasi
types/       Tipe data TypeScript
```

## Prasyarat

- Node.js 20.19 atau lebih baru (disarankan versi 22 LTS)
- SQL Server (lokal) dengan akses untuk menjalankan skrip di `backend/database/`

## Instalasi dan menjalankan

### 1. Database

Jalankan berurutan di SQL Server Management Studio / Azure Data Studio (folder `backend/database/`):

1. `00-setup-mixed-mode.sql` (bila perlu mengaktifkan mixed mode)
2. `01-create-database-and-user.sql`
3. `02-schema.sql`
4. `03-seed.sql`
5. `04-seed-password-hashes.sql` (mengganti password seed dengan hash bcrypt agar akun uji bisa login)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Isi `backend/.env`:

| Variabel | Keterangan |
|----------|------------|
| `DB_USER`, `DB_PASSWORD` | Login SQL Server dari skrip `01-...sql` |
| `JWT_SECRET` | **Wajib.** String acak: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | Origin frontend, default `http://localhost:5173` |

```bash
npm run dev                  # http://localhost:3000  (cek /health, dokumentasi di /docs)
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env         # Windows: copy .env.example .env
npm run dev                  # http://localhost:5173
```

`frontend/.env`:

| Variabel | Keterangan |
|----------|------------|
| `VITE_API_BASE_URL` | Base URL API termasuk prefix, default `http://localhost:3000/api/v1` |

Perintah lain: `npm run build` (type-check + build produksi), `npm run lint`.

> Jangan unggah `.env` ke GitHub. Repository hanya berisi `.env.example` tanpa nilai rahasia.

## Akun uji

Password semua akun: `rahasia123`.

| Role     | Email                | Keterangan |
|----------|----------------------|------------|
| admin    | `admin@kantin.test`  | Semua aksi warung |
| owner    | `tini@kantin.test`   | Pemilik Warung Bu Tini (id 1) |
| owner    | `slamet@kantin.test` | Pemilik Kedai Pak Slamet (id 3) |
| customer | `bagas@student.test` | Hanya melihat warung |

Akun baru lewat halaman Daftar otomatis berperan **customer**.

## Fitur dan endpoint

| Fitur | Endpoint | Halaman |
|-------|----------|---------|
| Daftar warung + cari, filter, urut, pagination | `GET /stalls` | `/` |
| Detail warung | `GET /stalls/:id` | `/stalls/:id` |
| Tambah warung | `POST /stalls` | `/stalls/new` |
| Ubah warung | `PUT /stalls/:id` | `/stalls/:id/edit` |
| Hapus warung | `DELETE /stalls/:id` | tombol Hapus (daftar dan detail) |
| Registrasi | `POST /auth/register` | `/register` |
| Login | `POST /auth/login` | `/login` |
| Informasi pengguna | `GET /auth/me` | dipanggil saat aplikasi dibuka; tampil di header |
| Logout | (tidak ada endpoint) | tombol Keluar: token JWT dihapus dari sisi client |

### Hak akses di tampilan

| Aksi | Tamu | Customer | Owner | Admin |
|------|:----:|:--------:|:-----:|:-----:|
| Lihat daftar dan detail | ✓ | ✓ | ✓ | ✓ |
| Tambah warung | – | – | ✓ | ✓ |
| Ubah warung | – | – | hanya miliknya | semua |
| Hapus warung | – | – | – | ✓ |

Tampilan hanya menyembunyikan tombol sesuai role. **Penjaga sebenarnya tetap backend**, yang menjawab
401 (belum login / token tidak valid) dan 403 (login tapi tidak berhak). Frontend menanganinya:

- **401** saat token tersimpan: token dihapus, pengguna dikembalikan ke kondisi tamu, tampil notifikasi "Sesi berakhir".
- **401** saat membuka halaman terlindungi tanpa login: diarahkan ke `/login` lalu kembali ke tujuan setelah masuk.
- **403**: panel "Tidak punya akses" atau pesan dari backend pada form/notifikasi.
- **400**: pesan validasi backend (`errors[]`) ditempel pada field yang bersangkutan.
- **Jaringan putus**: pesan "Tidak dapat terhubung ke server" dengan tombol coba lagi.

## Integrasi Axios

Semua request ada di `frontend/src/lib/api.ts`:

- `axios.create` dengan `baseURL` dari `VITE_API_BASE_URL` dan timeout 15 detik.
- Request interceptor menyisipkan header `Authorization: Bearer <token>` otomatis.
- Response interceptor mengubah semua kegagalan menjadi `ApiError` (status + pesan + detail validasi) dan
  membersihkan sesi saat 401.
- Query parameter (`params`) untuk `GET /stalls`, path parameter untuk `/stalls/:id`, request body untuk POST/PUT.

## Pemecahan masalah

| Gejala | Penyebab / solusi |
|--------|-------------------|
| "Tidak dapat terhubung ke server" | Backend belum jalan atau `VITE_API_BASE_URL` salah. Restart `npm run dev` frontend setelah mengubah `.env`. |
| Error CORS di konsol browser | `CORS_ORIGIN` di `backend/.env` harus sama dengan alamat frontend (mis. `http://localhost:5173`). Restart backend. |
| Backend menolak start | `JWT_SECRET` di `backend/.env` kosong. |
| Login selalu "Email atau password salah" | Skrip `04-seed-password-hashes.sql` belum dijalankan. |

Dokumentasi API lengkap (Swagger): `http://localhost:3000/docs`. README backend asli (Tugas 3): [`backend/README.md`](backend/README.md).