# API Golf Manager

Backend NestJS cho ứng dụng **golf-manager** (React Native / Expo). Dùng **SQLite** (TypeORM), JWT auth, REST API.

## Cài đặt

```bash
npm install --legacy-peer-deps
```

## Database: migrations & seed

```bash
# Tạo thư mục data, chạy migrations (tạo bảng)
npm run migration:run

# Seed dữ liệu mẫu: user demo, 1 sân, 4 slot
npm run seed

# Hoặc làm cả hai
npm run db:setup
```

**Dữ liệu seed:**
- User: `demo@golf.dev` / `demo123` (role: user)
- Admin: `admin@golf.dev` / `admin123` (role: admin)
- 1 sân: **Sân Golf Long Thành**
- 4 slot ngày mai (07:00–08:00, 08:00–09:00, …)

## Chạy API

```bash
npm run start:dev
```

API chạy tại **http://localhost:3000**.

## Các API (golf-manager sử dụng)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/auth/login` | Đăng nhập (body: email, password) |
| POST | `/auth/register` | Đăng ký (body: email, password, fullName, phone?) |
| POST | `/auth/forgot-password` | Quên mật khẩu (body: email) |
| POST | `/auth/refresh` | Đổi access token (body: refreshToken) |
| GET | `/courses` | Danh sách sân (public) |
| GET | `/courses/:courseId/slots` | Lấy slot theo sân (?date=YYYY-MM-DD) |
| GET | `/dashboard/stats` | Thống kê admin (Bearer token, role: admin) |
| POST | `/bookings` | Đặt chỗ (Bearer token, body: courseId, slotId, date) |
| GET | `/bookings/me` | Danh sách đặt chỗ của tôi (Bearer token) |
| DELETE | `/bookings/:bookingId` | Hủy đặt chỗ (Bearer token) |

## Cấu hình golf-manager (Expo)

Trong **golf-manager**, trỏ API về backend local:

- **config/env.ts** hoặc biến môi trường:  
  `EXPO_PUBLIC_API_URL=http://localhost:3000`  
  (Trên máy ảo Android dùng `http://10.0.2.2:3000`, trên thiết bị thật dùng IP máy của bạn.)

## Cấu trúc

- `src/entities/` – User, RefreshToken, Course, Slot, Booking
- `src/auth/` – Login, register, refresh, JWT strategy
- `src/courses/` – GET slots theo course
- `src/bookings/` – CRUD đặt chỗ (cần JWT)
- `src/dashboard/` – GET /dashboard/stats (chỉ admin)
- `src/migrations/` – TypeORM migrations
- `src/seed.ts` – Script seed dữ liệu mẫu
