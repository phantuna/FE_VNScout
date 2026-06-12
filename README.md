# 🇻🇳 Vietnam Photo Scout — Frontend

> Nền tảng mạng xã hội dành cho cộng đồng nhiếp ảnh Việt Nam — khám phá địa điểm chụp, chia sẻ tác phẩm và kết nối nhiếp ảnh gia.

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Thống kê thành phần](#thống-kê-thành-phần)
- [Cài đặt & Chạy local](#cài-đặt--chạy-local)
- [Biến môi trường](#biến-môi-trường)
- [Tính năng chính](#tính-năng-chính)

---

## 🌟 Giới thiệu

**Vietnam Photo Scout (VNScout)** là ứng dụng web hỗ trợ cộng đồng nhiếp ảnh Việt Nam:
- 📍 Tìm kiếm và chia sẻ **địa điểm chụp ảnh** trên bản đồ
- 🖼️ Đăng tải, bình luận và tương tác với **bài đăng ảnh**
- 💬 **Nhắn tin thời gian thực** giữa các thành viên (WebSocket/STOMP)
- 🔔 **Thông báo realtime**
- 👑 **Bảng quản trị Admin** kiểm duyệt nội dung

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Next.js | 16.1.6 |
| UI Library | React | 19.2.3 |
| Ngôn ngữ | TypeScript | 5.7.3 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | shadcn/ui (Radix UI) | latest |
| Form | React Hook Form + Zod | 7.x / 3.x |
| Realtime | STOMP.js over WebSocket | 7.3.0 |
| Charts | Recharts | 2.15.0 |
| Icons | Lucide React | 0.544.0 |
| Map | VietMap GL | — |
| Date | date-fns | 4.1.0 |
| Notifications | Sonner | 1.7.1 |

---

## 📁 Cấu trúc thư mục

```
v0_photo_scount_v1/
├── public/                     # Assets tĩnh
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Nhóm route xác thực
│   │   │   ├── login/          # Trang đăng nhập
│   │   │   └── signup/         # Trang đăng ký
│   │   ├── (main)/             # Nhóm route chính (đã xác thực)
│   │   │   ├── admin/          # Trang quản trị
│   │   │   ├── create/         # Tạo bài đăng mới
│   │   │   ├── explore/        # Khám phá bài đăng
│   │   │   ├── location/       # Chi tiết địa điểm
│   │   │   ├── map/            # Bản đồ địa điểm
│   │   │   ├── messages/       # Nhắn tin
│   │   │   ├── notifications/  # Thông báo
│   │   │   ├── post/           # Chi tiết bài đăng
│   │   │   ├── profile/        # Hồ sơ người dùng
│   │   │   └── settings/       # Cài đặt tài khoản
│   │   └── api/                # API Routes (Next.js)
│   ├── components/
│   │   ├── admin/              # Component trang Admin
│   │   ├── auth/               # Component xác thực
│   │   ├── explore/            # Component khám phá
│   │   ├── layout/             # Layout & Navigation
│   │   ├── location/           # Component địa điểm
│   │   ├── map/                # Component bản đồ
│   │   ├── messages/           # Component nhắn tin
│   │   ├── notifications/      # Component thông báo
│   │   ├── posts/              # Component bài đăng
│   │   ├── profile/            # Component hồ sơ
│   │   ├── settings/           # Component cài đặt
│   │   └── ui/                 # shadcn/ui primitives
│   ├── context/
│   │   └── AuthContext.tsx     # Global auth state
│   ├── hooks/                  # Custom React Hooks
│   ├── lib/                    # Utility functions
│   ├── services/               # API service layer
│   ├── types/                  # TypeScript types
│   └── utils/                  # Helper utilities
├── styles/
│   └── globals.css
├── .gitignore
├── Dockerfile
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📊 Thống kê thành phần hệ thống

### 🗺️ Routes / Pages (10 trang)

| Route | Mô tả | Yêu cầu Auth |
|---|---|---|
| `/login` | Đăng nhập | ❌ |
| `/signup` | Đăng ký | ❌ |
| `/` | Trang chủ (Feed) | ✅ |
| `/explore` | Khám phá bài đăng | ✅ |
| `/map` | Bản đồ địa điểm chụp | ✅ |
| `/create` | Tạo bài đăng mới | ✅ |
| `/post/[id]` | Chi tiết bài đăng | ✅ |
| `/location/[id]` | Chi tiết địa điểm | ✅ |
| `/profile/[username]` | Hồ sơ người dùng | ✅ |
| `/messages` | Nhắn tin | ✅ |
| `/notifications` | Thông báo | ✅ |
| `/settings` | Cài đặt tài khoản | ✅ |
| `/admin` | Quản trị hệ thống | ✅ 👑 ADMIN |

### ⚙️ Services (8 services)

| Service | Chức năng |
|---|---|
| `api.service.ts` | Axios instance, interceptors, token refresh |
| `post.service.ts` | CRUD bài đăng, like, bookmark |
| `user.service.ts` | Thông tin người dùng, cập nhật profile |
| `location.service.ts` | Địa điểm chụp (SPOT & SERVICE) |
| `chat.service.ts` | Lịch sử tin nhắn |
| `follow.service.ts` | Follow/Unfollow người dùng |
| `notification.service.ts` | Lấy & đọc thông báo |
| `tag.service.ts` | Tìm kiếm tags |

### 🪝 Custom Hooks (7 hooks)

| Hook | Chức năng |
|---|---|
| `use-explore-feed.ts` | Infinite scroll feed, filter, search |
| `use-map-view.ts` | Logic bản đồ VietMap, marker, clustering |
| `use-follow.ts` | Quản lý trạng thái follow |
| `useChat.ts` | WebSocket STOMP realtime chat |
| `use-guest-guard.ts` | Redirect khách về trang login |
| `use-mobile.tsx` | Responsive breakpoint detection |
| `use-toast.ts` | Toast notification management |

### 🧩 Component Groups (12 nhóm)

| Nhóm | Số lượng ước tính | Mô tả |
|---|---|---|
| `ui/` | ~40 | shadcn/ui primitives (Button, Dialog, ...) |
| `posts/` | ~10 | PostCard, Feed, CreatePost, Comments |
| `layout/` | ~6 | Sidebar, Header, MobileNav |
| `admin/` | ~8 | Quản lý user, bài đăng, báo cáo |
| `map/` | ~5 | MapView, Markers, Popup |
| `profile/` | ~6 | ProfileHeader, PostGrid, FollowList |
| `messages/` | ~5 | ChatList, ChatBox, MessageBubble |
| `location/` | ~5 | LocationCard, LocationDetail |
| `explore/` | ~4 | ExploreGrid, Filters |
| `notifications/` | ~3 | NotificationItem, NotificationList |
| `auth/` | ~4 | LoginForm, SignupForm |
| `settings/` | ~4 | ProfileSettings, SecuritySettings |

---

## 🚀 Cài đặt & Chạy local

### Yêu cầu

- Node.js >= 18.x
- npm hoặc pnpm

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/phantuna/FE_VNScout.git
cd FE_VNScout

# 2. Cài dependencies
npm install
# hoặc
pnpm install

# 3. Tạo file biến môi trường
cp .env.example .env.local

# 4. Chạy development server
npm run dev
```

Mở trình duyệt tại: **http://localhost:3000**

---

## 🔐 Biến môi trường

Tạo file `.env.local` (không commit file này lên Git):

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# VietMap API Key (bản đồ)
NEXT_PUBLIC_VIETMAP_API_KEY=your_vietmap_key_here

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

> ⚠️ **Lưu ý:** Các file `.env.*` đã được thêm vào `.gitignore` để bảo mật API keys.

---

## ✨ Tính năng chính

- 🔐 **Xác thực** — JWT, Refresh Token tự động, OAuth2
- 📰 **News Feed** — Infinite scroll, real-time updates
- 🗺️ **Bản đồ tương tác** — VietMap GL, marker clusters, filter theo loại địa điểm
- ☀️ **Golden Hour Calculator** — Tính toán giờ vàng chụp ảnh bằng SunCalc
- 📍 **Địa điểm** — Tìm kiếm, lọc SPOT/SERVICE, gợi ý theo vị trí
- 💬 **Chat realtime** — WebSocket/STOMP, typing indicator
- 🔔 **Thông báo realtime** — Like, comment, follow
- 👥 **Mạng xã hội** — Follow, profile, newsfeed cá nhân hóa
- 🛡️ **Kiểm duyệt nội dung** — Bộ lọc từ ngữ xấu, báo cáo bài đăng
- 👑 **Admin Dashboard** — Quản lý người dùng, bài đăng, báo cáo, cấu hình

---

## 🎓 Thông tin đồ án

- **Tên đề tài:** Vietnam Photo Scout — Nền tảng mạng xã hội hỗ trợ cộng đồng nhiếp ảnh Việt Nam
- **Loại:** Đồ án tốt nghiệp (ĐATN)
- **Repo Backend:** [VietnamPhoto Backend](https://github.com/phantuna/VietnamPhoto)
