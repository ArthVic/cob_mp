# Cognitive Health Screening

An AI-powered web application for early dementia detection through a comprehensive suite of cognitive assessments. Complete 5 validated cognitive tests in approximately 15 minutes to receive personalized insights about cognitive health.

## 🧠 Overview

This application provides a user-friendly interface for cognitive health screening, featuring multiple scientifically-validated tests designed to assess various aspects of cognitive function. The platform securely stores user data, demographic information, and test results to track cognitive health over time.

## ✨ Features

- **Multiple Cognitive Assessments**
  - Memory Test
  - Reaction Time Test
  - Verbal Fluency Test
  - Clock Drawing Test
  - Digit Span Test
  - Recall Test

- **User Management**
  - Secure authentication via Supabase
  - User session management
  - Demographic data collection

- **Results & Analytics**
  - Comprehensive test results display
  - AI-powered analysis and reporting
  - Historical tracking capabilities

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Accessible components from shadcn/ui
  - Smooth navigation with React Router
  - Dark mode support

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TanStack Query** - Data fetching and state management

### UI Components & Styling
- **shadcn/ui** - Component library (Radix UI primitives)
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL database
  - Edge functions for AI analysis

### Form Management & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Libraries
- **date-fns** - Date utilities
- **recharts** - Data visualization
- **next-themes** - Theme management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** or **bun** - Package manager
- **Git** - Version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd cob_mp
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun:
```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
cob_mp/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/         # shadcn/ui components
│   ├── pages/          # Route components
│   │   ├── Index.tsx
│   │   ├── Auth.tsx
│   │   ├── Demographics.tsx
│   │   ├── TestIntro.tsx
│   │   ├── MemoryTest.tsx
│   │   ├── ReactionTest.tsx
│   │   ├── FluencyTest.tsx
│   │   ├── ClockTest.tsx
│   │   ├── DigitTest.tsx
│   │   ├── RecallTest.tsx
│   │   ├── Results.tsx
│   │   └── NotFound.tsx
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Third-party integrations
│   │   └── supabase/   # Supabase client and API
│   ├── lib/            # Utility functions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── supabase/           # Supabase configuration
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Vite Configuration

The development server runs on port `8080` by default. You can modify this in `vite.config.ts`.

### Tailwind CSS

Tailwind is configured with custom settings in `tailwind.config.ts`, including:
- Custom color schemes
- Animation utilities
- Typography plugin support

### TypeScript

The project uses strict TypeScript configuration with path aliases:
- `@/*` maps to `./src/*`

## 🗄️ Database

The project uses Supabase PostgreSQL database. Database migrations are located in `supabase/migrations/`.

### Edge Functions

Supabase Edge Functions are located in `supabase/functions/`:
- `generate-report` - Generates analysis reports
- `process-analysis` - Processes test results

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## 🔐 Authentication

The application uses Supabase Authentication. Users must authenticate before accessing tests and viewing results. Authentication state is managed globally through Supabase's session management.

## 🧪 Cognitive Tests

The application includes six validated cognitive assessments:

1. **Memory Test** - Assesses working memory capacity
2. **Reaction Test** - Measures reaction time and processing speed
3. **Fluency Test** - Evaluates verbal fluency and language skills
4. **Clock Test** - Tests visuospatial abilities and executive function
5. **Digit Test** - Assesses attention and working memory
6. **Recall Test** - Evaluates memory recall abilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues and questions, please open an issue in the repository or contact the development team.

## 🔗 Related Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Built with ❤️ for cognitive health awareness
