# 🔬 LabLocator — Smart Diagnostic Lab Discovery & Booking System

> A full-stack web application that connects patients with nearby diagnostic laboratories, enabling seamless test booking, AI-powered medical report analysis, and real-time notifications.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🌐 Overview

**LabLocator** is a Smart Diagnostic Lab Discovery and Booking System designed to bridge the gap between patients and diagnostic laboratories. The platform allows patients to search for nearby labs based on their geographic location, browse available tests, book appointments, upload medical reports for AI-driven analysis, and receive real-time notifications — all from a single, modern web interface.

Lab owners can register their labs, manage test offerings, define time slots, handle booking requests, and track reviews. A dedicated admin panel provides full oversight of all lab registration requests and platform users.

---

## ✨ Features

### 👤 Patient Features
- **Register & Login** with email verification (OTP-based)
- **Forgot / Reset Password** via secure email link
- **Discover Nearby Labs** on an interactive map (Leaflet.js + Geolocation)
- **Search Labs** by name, city, or test type
- **View Lab Details** — tests, slots, ratings, and reviews
- **Book Tests** with time-slot selection
- **My Bookings** — view, cancel, and track booking status
- **Write Reviews** for completed bookings with star ratings
- **AI Medical Report Analysis** — upload a PDF report and get an AI-powered summary of findings, abnormal values, and health suggestions (powered by Google Gemini)
- **Real-Time Notifications** via WebSocket (STOMP over SockJS)
- **User Profile** — update name, phone, profile picture (Cloudinary)
- **Delete Account** (Patient role only)

### 🏥 Lab Owner Features
- **Submit Lab Registration Request** to the admin for approval
- **Owner Dashboard** — manage lab profile, images, tests, and time slots
- **Manage Bookings** — confirm, reject, or mark bookings as completed
- **Upload Lab Images** to Cloudinary
- **Add / Edit / Remove Tests** offered by the lab
- **Manage Time Slots** (opening/closing hours)
- **View Reviews** left by patients

### 🛡️ Admin Features
- **Admin Dashboard** — full platform oversight
- **Approve / Reject Lab Registration Requests**
- **Manage Existing Labs** — edit, approve updates, or remove labs
- **View All Users** on the platform

### 🔔 Notifications
- Real-time in-app notifications via WebSocket
- Toast pop-ups for booking confirmations, cancellations, and status updates
- Notification bell with unread count indicator

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS 3** | Utility-first styling |
| **HeroUI** | UI component library |
| **Framer Motion** | Animations & transitions |
| **Leaflet / React-Leaflet** | Interactive map rendering |
| **Axios** | HTTP client |
| **@stomp/stompjs + SockJS** | WebSocket real-time communication |
| **Lucide React** | Icon set |

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** | Language |
| **Spring Boot 4.0** | Application framework |
| **Spring Security + JWT** | Authentication & authorization |
| **Spring Data JPA + Hibernate** | ORM & database access |
| **Spring WebSocket (STOMP)** | Real-time messaging |
| **Spring Mail** | Email service |
| **PostgreSQL** | Relational database |
| **Cloudinary** | Image/file storage |
| **Apache PDFBox** | PDF text extraction |
| **Google Gemini API** | AI-powered report analysis |
| **Lombok** | Boilerplate reduction |
| **Jackson (JSR-310)** | JSON serialization with Java 8 date/time |
| **JJWT 0.11.5** | JWT creation & validation |
| **Maven** | Build & dependency management |

---

## 📁 Project Structure

```
labLocator/
├── frontend/                        # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                     # Axios API call modules
│   │   │   ├── auth.js              # Auth API (login, register, etc.)
│   │   │   ├── axios.js             # Axios instance with JWT interceptor
│   │   │   ├── ai.js                # AI analysis API
│   │   │   └── user.js              # User profile API
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── ReportAnalysisModal.jsx
│   │   │   ├── LabsMap.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── OwnerRoute.jsx
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.jsx      # Auth state & actions
│   │   │   └── NotificationContext.jsx # WebSocket notification state
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── LabDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── MyProfile.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── HomeRedirectGuard.jsx
│   │   ├── App.jsx                  # Root app with routing
│   │   └── main.jsx                 # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/                         # Spring Boot backend
    └── src/main/java/com/lablocator/
        ├── LabLocatorApplication.java
        ├── config/                  # App-level configuration
        │   ├── CloudinaryConfig.java
        │   ├── CorsConfig.java
        │   ├── JacksonConfig.java
        │   └── WebSocketConfig.java
        ├── controllers/             # REST API controllers
        │   ├── authController.java
        │   ├── userController.java
        │   ├── LabController.java
        │   ├── LabTestController.java
        │   ├── LabRequestController.java
        │   ├── BookingController.java
        │   ├── ReviewController.java
        │   ├── ReportController.java
        │   ├── NotificationController.java
        │   ├── AIController.java
        │   └── TestController.java
        ├── model/                   # JPA entity classes
        │   ├── User.java / Role.java
        │   ├── Lab.java
        │   ├── LabTest.java / Test.java
        │   ├── LabSlot.java
        │   ├── Booking.java / BookingStatus.java / BookingTest.java
        │   ├── LabRequest.java / RequestStatus.java / RequestType.java
        │   ├── Review.java
        │   ├── Report.java
        │   ├── Notification.java
        │   └── CancelledBy.java
        ├── service/                 # Business logic services
        │   ├── AuthService.java
        │   ├── UserService.java
        │   ├── LabService.java
        │   ├── LabTestService.java
        │   ├── BookingService.java
        │   ├── LabRequestService.java
        │   ├── ReviewService.java
        │   ├── ReportService.java
        │   ├── NotificationService.java
        │   ├── CloudinaryService.java
        │   ├── TestService.java
        │   ├── ai/
        │   │   ├── AIService.java
        │   │   ├── GeminiService.java
        │   │   ├── PdfService.java
        │   │   ├── ReportAnalysis.java
        │   │   └── ReportAnalysisException.java
        │   └── email/
        │       ├── EmailService.java
        │       └── EmailServiceImplement.java
        ├── security/                # JWT & Spring Security
        │   ├── SecurityConfig.java
        │   ├── JwtService.java
        │   ├── JwtAuthenticationFilter.java
        │   ├── CustomUserDetailsService.java
        │   └── WebSocketAuthInterceptor.java
        ├── dto/                     # Data Transfer Objects
        ├── repository/              # Spring Data JPA repositories
        ├── projection/              # Interface-based projections
        └── exceptions/              # Global exception handling
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│           React 19 + Vite + TailwindCSS + Leaflet           │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────┐ │
│  │   Pages  │  │Components │  │  AuthContext /            │ │
│  │  (Routes)│  │(Map, Bell,│  │  NotificationContext      │ │
│  │          │  │ Modal...) │  │  (WebSocket via STOMP)    │ │
│  └──────────┘  └───────────┘  └──────────────────────────┘ │
│              │ Axios (JWT Bearer)  │ STOMP/SockJS           │
└──────────────┼─────────────────────┼───────────────────────┘
               │ REST API            │ WebSocket /ws
┌──────────────▼─────────────────────▼───────────────────────┐
│                   Spring Boot 4 Backend                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  REST       │  │  WebSocket   │  │  Spring Security   │ │
│  │  Controllers│  │  (STOMP)     │  │  (JWT Filter)      │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────┘ │
│         │                │                                   │
│  ┌──────▼────────────────▼──────────────────────────────┐  │
│  │                  Service Layer                        │  │
│  │  Auth │ Lab │ Booking │ Review │ Notification │ AI    │  │
│  └──────┬──────────────────────────────────────┬────────┘  │
│         │                                       │            │
│  ┌──────▼──────┐                      ┌────────▼─────────┐ │
│  │  PostgreSQL │                      │  External APIs   │ │
│  │  (JPA/ORM)  │                      │  Cloudinary      │ │
│  └─────────────┘                      │  Gemini AI       │ │
│                                       │  SMTP (Mail)     │ │
│                                       └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 21+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |

---

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/riteshloura/medical-lab-finder.git
   cd labLocator/backend
   ```

2. **Create a PostgreSQL database**
   ```sql
   CREATE DATABASE lablocator;
   ```

3. **Configure `application.properties`**

   Create or edit `src/main/resources/application.properties`:
   ```properties
   # Server
   server.port=8080

   # Database
   spring.datasource.url=jdbc:postgresql://localhost:5432/lablocator
   spring.datasource.username=your_pg_username
   spring.datasource.password=your_pg_password
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true

   # JWT
   jwt.secret=your_jwt_secret_key_here
   jwt.expiration=86400000

   # Email (SMTP)
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true

   # Cloudinary
   cloudinary.cloud_name=your_cloud_name
   cloudinary.api_key=your_api_key
   cloudinary.api_secret=your_api_secret

   # Google Gemini AI
   gemini.api.key=your_gemini_api_key
   ```

4. **Run the backend**
   ```bash
   ./mvnw spring-boot:run
   ```
   The API server starts at `http://localhost:8080`.

---

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd labLocator/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:5173`.

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔐 Environment Variables

### Backend (`application.properties`)

| Property | Description |
|---|---|
| `spring.datasource.url` | PostgreSQL JDBC connection URL |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `jwt.secret` | Secret key for signing JWT tokens |
| `jwt.expiration` | Token expiry in milliseconds |
| `spring.mail.username` | Gmail address for sending emails |
| `spring.mail.password` | Gmail App Password |
| `cloudinary.cloud_name` | Cloudinary cloud name |
| `cloudinary.api_key` | Cloudinary API key |
| `cloudinary.api_secret` | Cloudinary API secret |
| `gemini.api.key` | Google Gemini API key |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## 📡 API Overview

| Module | Base Path | Description |
|---|---|---|
| Authentication | `/api/auth/**` | Register, login, verify email, forgot/reset password |
| User | `/api/user/**` | Profile management, account deletion |
| Labs | `/api/labs/**` | Lab search, nearby discovery, lab details |
| Lab Requests | `/api/lab-requests/**` | Submit, approve/reject lab registration requests |
| Lab Tests | `/api/lab-tests/**` | Manage tests offered by a lab |
| Bookings | `/api/booking/**` | Create, manage, cancel bookings |
| Reviews | `/api/lab/{labId}/review` | Submit and fetch lab reviews |
| Reports | `/api/report/**` | Upload medical reports |
| AI Analysis | `/api/ai/**` | Trigger Gemini AI analysis on uploaded reports |
| Notifications | `/api/notifications/**` | Fetch and mark notifications |
| WebSocket | `/ws` | Real-time notification delivery (STOMP/SockJS) |

### Key Public Endpoints (No Auth Required)
```
GET  /api/labs/nearby     — Find labs near a coordinate
GET  /api/labs/search     — Search labs by keyword
GET  /api/labs/{id}       — Get lab details
GET  /api/labs/{id}/tests — Get tests for a lab
GET  /api/tests           — Get all available tests
POST /api/auth/register   — Register a new user
POST /api/auth/login      — Login and receive JWT
POST /api/auth/verify-email       — Verify email with OTP
POST /api/auth/forgot-password    — Request password reset link
POST /api/auth/reset-password     — Reset password with token
```

---

## 👥 User Roles

| Role | Description |
|---|---|
| `PATIENT` | Default role. Can search labs, book tests, write reviews, upload reports, and delete their account. |
| `LAB_OWNER` | Can register a lab (pending admin approval), manage lab details, slots, tests, and bookings. |
| `ADMIN` | Has full platform oversight. Approves/rejects lab registrations and manages users. |

---

## 🔒 Security

- **JWT Authentication** — All protected routes require a valid `Bearer` token in the `Authorization` header.
- **Stateless Sessions** — No server-side session storage; all state is in the JWT.
- **BCrypt Password Hashing** — All passwords are hashed before storage.
- **Role-Based Access Control** — Spring Security's `@PreAuthorize` and method-level security enforce role restrictions.
- **WebSocket Security** — STOMP channel interceptor validates JWT before allowing WebSocket subscriptions.
- **Email Verification** — New accounts must verify their email via OTP before logging in.
- **CORS** — Configured to allow requests only from the frontend origin.

---

## 🗺 Key User Flows

### Patient Booking Flow
```
Register → Verify Email → Login → Search/Discover Labs →
View Lab Details → Select Test + Slot → Confirm Booking →
Receive Real-Time Notification → View in My Bookings →
Upload Report → AI Analysis → Write Review
```

### Lab Owner Flow
```
Register (LAB_OWNER role) → Submit Lab Registration Request →
Admin Approves → Access Owner Dashboard → Add Tests & Slots →
Manage Incoming Bookings → Confirm / Complete / Reject
```

### Admin Flow
```
Login (ADMIN role) → Admin Dashboard →
Review Pending Lab Requests → Approve / Reject →
Manage Platform Labs & Users
```

---

## 📦 Notable Libraries & Integrations

- **Google Gemini AI** — Extracts and analyzes medical report text (via PDFBox), then sends it to Gemini for structured health insights including abnormal findings and recommendations.
- **Cloudinary** — Handles all media uploads: lab images and user profile pictures, served via CDN.
- **Leaflet.js** — Renders an interactive map of nearby labs using browser geolocation, with clickable markers and popup summaries.
- **STOMP over SockJS** — WebSocket protocol layer for real-time push notifications with JWT-authenticated channel interceptor.
- **Spring Mail** — Sends HTML emails for OTP verification and password reset links.

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
./mvnw test

# Frontend lint check
cd frontend
npm run lint
```

---

## 📄 License

This project is developed as a **Major Academic Project**. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ using Spring Boot & React</strong>
</div>
