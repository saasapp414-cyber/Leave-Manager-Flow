# LeaveFlow — Production Leave Management System

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Firebase (Auth + Firestore + Storage)
- **State**: Zustand + React Query
- **Charts**: Recharts
- **Animations**: Framer Motion

## Roles
| Role | Permissions |
|------|------------|
| Employee | Apply leaves, view history, check balance |
| Manager | All employee + approve/reject team leaves |
| HR Admin | All manager + approve all, manage employees, reports |
| Super Admin | All HR + org settings, policy config |

## Setup

### 1. Firebase Project
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create **Firestore** database (start in production mode)
4. Enable **Storage**

### 2. Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['hr_admin','super_admin'];
    }
    match /leaves/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /leave_balances/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /notifications/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Install & Run
```bash
cp .env.example .env
# Fill in your Firebase config in .env

npm install
npm run dev
```

### 4. First Login
- Sign up as Super Admin (this creates the organization)
- Add employees via Employees page
- Configure leave policy in Organization settings

## Firebase Indexes Required
Add these composite indexes in Firestore:
- `leaves`: `organizationId ASC, createdAt DESC`
- `leaves`: `userId ASC, createdAt DESC`
- `leaves`: `organizationId ASC, status ASC, createdAt DESC`
- `notifications`: `userId ASC, createdAt DESC`

## Deployment
```bash
npm run build
# Deploy dist/ to Firebase Hosting, Vercel, or Netlify
```

## Folder Structure
```
src/
├── components/
│   ├── ui/          # Reusable primitives
│   ├── layout/      # Sidebar, Header, AppLayout
│   └── shared/      # ProtectedRoute
├── hooks/           # useAuth, useLeaves, useBalance
├── lib/             # Firebase config, utils, service layer
├── pages/           # Route-level components
├── store/           # Zustand stores
└── types/           # TypeScript types
```
# leaveflow
