# TeamUp - Project Management Platform

**TeamUp** là nền tảng quản lý dự án nhóm học tập, đóng vai trò như một "trọng tài" khách quan giúp:

- Chia việc theo khối lượng (không chỉ theo đầu việc)
- Log-work tự động & nộp bài lên hệ thống
- Check-in tiến độ tự động (nhắc nhở khi 3 ngày không hoạt động)
- Đánh giá ngang hàng (peer review) ẩn danh cuối kỳ
- Dashboard thống kê real-time với biểu đồ đóng góp

## Tính năng chính

### 1. Quản lý công việc
- Thanh tiến độ 0-100% cho từng task
- Trạng thái: To Do → In Progress → Pending Review → Done
- Giao việc cho từng thành viên
- Đặt deadline và ước lượng thời gian

### 2. Nộp bài tự động
- Upload file đính kèm (slide, văn bản, code...)
- Ghi nhận thời gian nộp để check trễ hạn
- Leader duyệt/reject submission

### 3. Dashboard Real-time
- Biểu đồ tròn thể hiện % đóng góp
- Thống kê tiến độ nhóm
- Xem ai hay trễ deadline

### 4. Cron Job tự động
- Quét hệ thống mỗi giờ
- Cảnh báo khi task không có thay đổi trong 3 ngày
- Nhắc nhở deadline sắp đến

### 5. Peer Review ẩn danh
- Đánh giá thái độ hợp tác (1-5 sao)
- Đánh giá chi tiết: Giao tiếp, Hợp tác, Trách nhiệm, Chất lượng
- Bình luận ẩn danh

### 6. Export báo cáo
- Xuất PDF với PDFKit
- Xuất Excel với ExcelJS
- Bao gồm: % đóng góp, lịch sử nộp bài, điểm peer review

## Công nghệ sử dụng

### Backend
- Node.js + Express.js
- MongoDB Atlas (Cloud Database)
- JWT Authentication
- Cloudinary (Cloud File Storage)
- Multer cho upload file
- node-cron cho scheduled tasks
- PDFKit & ExcelJS cho export

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Chart.js / Recharts cho biểu đồ
- React Hot Toast

## Cấu trúc thư mục

```
TeamUpVip/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Cron jobs
│   │   └── utils/         # Utilities
│   ├── uploads/           # Uploaded files
│   └── package.json
│
└── client/                 # Frontend
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/      # React contexts
    │   ├── pages/        # Page components
    │   ├── services/     # API calls
    │   └── utils/        # Utilities
    ├── public/
    └── package.json
```

## Hướng dẫn triển khai

### Yêu cầu
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn

### 1. Cài đặt MongoDB

#### Option A: MongoDB Atlas (Cloud - Khuyến nghị)

**Ưu điểm:**
- Miễn phí 512MB storage
- Không cần cài đặt local
- Access từ bất kỳ đâu
- Tự động backup

**Các bước:**

1. **Tạo tài khoản:**
   ```
   https://www.mongodb.com/atlas
   ```

2. **Tạo Cluster Free:**
   - Chọn **Build a Database**
   - Chọn **Free Tier** (M0 Sandbox)
   - Region: Singapore (gần nhất)
   - Click **Create**

3. **Tạo Database User:**
   - Vào **Security** → **Database Access**
   - Click **Add New Database User**
   - Username: `teamupadmin`
   - Password: (tạo password mới, **LƯU LẠI**)
   - Role: **Read and write to any database**
   - Click **Add User**

4. **Configure Network Access:**
   - Vào **Security** → **Network Access**
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere**
   - Click **Confirm**

5. **Lấy Connection String:**
   - Vào **Deployment** → **Database**
   - Click **Connect** trên cluster
   - Chọn **Connect your application**
   - Copy connection string, thay `<password>` bằng password đã tạo:

   ```javascript
   mongodb+srv://teamupadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/teamup?retryWrites=true&w=majority
   ```

6. **Cập nhật .env:**
   ```env
   MONGODB_URI=mongodb+srv://teamupadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/teamup?retryWrites=true&w=majority
   ```

#### Option B: Docker (Local)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: Cài đặt Local

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Tải MongoDB Community Server từ https://www.mongodb.com/try/download/community
2. Cài đặt và chạy service

### 2. Clone và cài đặt

```bash
# Clone project
cd TeamUpVip

# Cài đặt backend dependencies
cd server
npm install

# Copy environment file
cp .env.example .env
# Chỉnh sửa .env nếu cần

# Cài đặt frontend dependencies
cd ../client
npm install
```

### 3. Chạy ứng dụng

**Chế độ Development:**

Terminal 1 - Backend:
```bash
cd server
npm run dev
# Server chạy tại http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
# Client chạy tại http://localhost:3000
```

**Chế độ Production:**

Build frontend:
```bash
cd client
npm run build
```

Chạy server:
```bash
cd server
npm start
```

### 4. Cấu hình Cron Job (Optional)

Để chạy cron job riêng:
```bash
cd server
npm run cron
```

Cron job mặc định đã được tích hợp trong server và chạy mỗi giờ.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Groups
- `POST /api/groups` - Tạo nhóm
- `GET /api/groups/my` - Lấy nhóm của tôi
- `GET /api/groups/:groupId` - Chi tiết nhóm
- `POST /api/groups/join` - Tham gia nhóm (bằng invite code)

### Tasks
- `POST /api/tasks` - Tạo công việc
- `GET /api/tasks/group/:groupId` - Lấy công việc theo nhóm
- `GET /api/tasks/my` - Lấy công việc của tôi
- `PUT /api/tasks/:taskId/progress` - Cập nhật tiến độ
- `POST /api/tasks/:taskId/approve` - Duyệt công việc
- `POST /api/tasks/:taskId/reject` - Từ chối công việc

### Submissions
- `POST /api/submissions` - Nộp bài (upload file)
- `GET /api/submissions/task/:taskId` - Lấy submissions của task
- `POST /api/submissions/:id/approve` - Duyệt bài nộp
- `POST /api/submissions/:id/reject` - Từ chối bài nộp

### Peer Reviews
- `POST /api/peer-reviews` - Tạo đánh giá
- `GET /api/peer-reviews/group/:groupId` - Lấy đánh giá của nhóm
- `GET /api/peer-reviews/stats/:groupId` - Thống kê đánh giá

### Reports
- `GET /api/reports/contribution/:groupId` - Thống kê đóng góp
- `GET /api/reports/dashboard/:groupId` - Dashboard data
- `GET /api/reports/export/pdf/:groupId` - Export PDF
- `GET /api/reports/export/excel/:groupId` - Export Excel

## Database Schema

Xem file `docs/database-schema.sql` để biết chi tiết cấu trúc database.

## Môi trường Development

Tạo file `.env` trong thư mục `server/`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamup
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

## License

MIT License
