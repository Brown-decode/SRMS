# SRMS Frontend

School Results Management System - Frontend Application

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (ProtectedRoute, RoleGuard)
│   ├── layout/          # Layout components (DashboardLayout, Sidebar, etc.)
│   └── ui/              # Reusable UI components (StatCard, DataTable, etc.)
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom hooks (useAuth, usePermissions)
├── pages/              # Route-based pages
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin dashboard pages
│   ├── teacher/        # Teacher dashboard pages
│   └── student/        # Student dashboard pages
├── router/             # React Router configuration
├── services/
│   ├── api/            # API service layer
│   └── storage/        # Local storage utilities
├── styles/             # Global styles
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## Features

### Authentication
- JWT-based authentication
- Role-based access control (ADMIN, TEACHER, STUDENT, SUPERUSER)
- Protected routes with role validation
- Token management with automatic refresh

### Layout System
- Modern SaaS layout with sidebar navigation
- Responsive design (desktop, tablet, mobile)
- Role-based navigation menu
- User profile and notifications

### UI Components
- Reusable components with consistent design
- Stat cards for dashboard metrics
- Data tables with sorting and actions
- Loading states and error handling
- Form components with validation

### API Integration
- Axios HTTP client with interceptors
- Automatic token attachment
- Error handling and response transformation
- Service layer for API endpoints

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. User logs in via `/auth/login`
2. JWT token is stored in localStorage
3. Token is attached to all API requests via Axios interceptor
4. Protected routes check authentication status
5. Role-based navigation is displayed based on user permissions

## Role-Based Access

- **SUPERUSER**: Full system access including user management
- **ADMIN**: Manage students, teachers, classes, subjects, assessments
- **TEACHER**: Manage assessments, view class results, assigned subjects
- **STUDENT**: View personal results, class information, profile

## API Integration

The frontend integrates with the FastAPI backend using the following API endpoints:

- Authentication: `/auth/login`, `/auth/users`
- Students: `/students/`
- Teachers: `/teachers/`
- Classes: `/classes/`
- Subjects: `/subjects/`
- Assessments: `/assessment/`
- Class-Subjects: `/class_subject/`

All API requests are automatically authenticated using JWT tokens stored in localStorage.
