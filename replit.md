# VoiceDev X - Voice-Driven Code Assistant

## Overview

VoiceDev X is a comprehensive full-stack web application that serves as a voice-driven coding assistant. The application allows users to speak programming commands in any language (English, Urdu, Hindi, Arabic, Spanish, French), which are then translated, processed by AI, and converted into code that can be reviewed and applied to project files. The system is designed to simulate a VS Code extension experience within a web interface.

## Complete Technology Stack

### Frontend Stack
- **React 18** with TypeScript for component-based UI
- **Vite** for ultra-fast development and production builds
- **shadcn/ui** built on Radix UI primitives for accessible components
- **Tailwind CSS** with custom VS Code theme variables
- **TanStack Query v5** for server state management and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation for forms
- **Lucide React** for consistent iconography
- **Web Speech API** for browser-native voice recognition
- **speechSynthesis API** for voice output capabilities

### Backend Stack
- **Node.js** with Express.js framework
- **TypeScript** with ES modules for type safety
- **PostgreSQL** with connection pooling for data persistence
- **Drizzle ORM** with TypeScript-first approach
- **Connect-pg-simple** for PostgreSQL session storage
- **Zod** for runtime type checking and validation
- **tsx** for TypeScript execution in development
- **esbuild** for production builds

### AI & Voice Technologies
- **Browser Speech Recognition** via Web Speech API
- **Voice Synthesis** using browser speechSynthesis API
- **Multi-language Pattern Matching** for command interpretation
- **Context-aware Code Generation** with AI processing pipeline
- **Real-time Translation** and language detection

### Database & Data Management
- **PostgreSQL** as primary database
- **Drizzle ORM** for type-safe database operations
- **Database Schema**: Voice commands, code generations, project files
- **Session Management** with database-backed storage
- **Real-time Synchronization** between frontend and backend

## Enhanced Features (Latest Update - January 25, 2025)

- **Complete VS Code Interface**: Functional activity bar with Extensions, Files, Search, Code, and Settings tabs
- **Smart File Management**: Auto-extension detection ("Make a CSS file named style" → style.css), file deletion, folder operations
- **Voice Assistant with Speech Output**: Dev X Assistant speaks responses, greets users with "Hello Sir!", confirms actions
- **Advanced Voice Commands**: Natural language patterns for file creation, code modification, debugging, and project management  
- **Intelligent Code Editing**: Live code modification, function replacement, line-by-line editing, and whole-file updates
- **Debug & Run Functionality**: Code execution with detailed analysis, warnings, output display, and performance metrics
- **Multi-Language Voice Input**: Real-time detection and processing from 6+ languages with enhanced pattern matching
- **Complete File Operations**: Create, delete, modify files/folders with voice commands and real-time sync
- **Production-Ready Deployment**: Full backend-frontend integration with PostgreSQL, session management, and Replit deployment
- **Comprehensive Documentation**: Complete README, deployment guide, and API documentation for production use

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom VS Code-inspired theme variables
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Voice Recognition**: Web Speech API for browser-based speech-to-text

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Database**: PostgreSQL with Drizzle ORM (fully integrated)
- **Database Provider**: Replit PostgreSQL (persistent database)
- **Session Management**: Database-backed persistent storage with relations
- **Data Models**: Voice commands, code generations, and project files with relational integrity

## Key Components

### Voice Processing Pipeline
1. **Voice Input**: Browser-based speech recognition using Web Speech API
2. **Translation**: Planned integration for multi-language support
3. **AI Processing**: Integration point for LLM-based code generation (currently mocked)
4. **Code Review**: User approval system before code application

### Data Models
- **Voice Commands**: Stores original speech, translated text, language detection, and confidence scores
- **Code Generations**: Links generated code to voice commands with approval status
- **Project Files**: Manages project file structure and content

### UI Components
- **Voice Interface**: Recording controls with visual feedback (waveform animation)
- **Code Preview**: Syntax-highlighted code display with approval controls
- **File Explorer**: VS Code-style file tree navigation
- **Confirmation Dialogs**: Security-focused approval system for code changes

## Data Flow

1. User activates voice recording through the microphone button
2. Speech is captured and transcribed using Web Speech API
3. Transcribed text is sent to the backend for processing
4. AI generates code based on the voice command (integration point for LLM)
5. Generated code is presented to user for review
6. User approves or rejects the code through confirmation dialog
7. Approved code is applied to project files and stored in database

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server state
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking
- **Session Storage**: Connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Implemented Integrations
- **Voice Synthesis**: Browser speechSynthesis API for Dev X Assistant voice output
- **Multi-Language Detection**: Enhanced voice command parsing for various languages
- **Real-time Code Processing**: Integrated backend API for immediate code generation and file management

### Backend-Frontend Integration
- **API Routes**: `/api/generate-code`, `/api/code-generations`, `/api/voice-commands`
- **Database Sync**: Real-time file changes synchronized with PostgreSQL
- **Session Management**: Persistent user sessions with database-backed storage
- **Voice Processing Pipeline**: Complete flow from speech → translation → AI → code → database

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL for database connection
- **Development Tools**: Replit-specific tooling for cloud development

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: esbuild bundling for Node.js deployment
- **Assets**: Static file serving through Express
- **Database**: Drizzle migrations for schema management

### Security Considerations
- **User Approval**: All code changes require explicit user confirmation
- **Input Validation**: Zod schemas validate all API inputs
- **CORS**: Configured for development and production environments
- **Session Management**: Secure session handling with PostgreSQL storage

### Performance Optimizations
- **Database**: Connection pooling with Neon serverless
- **Frontend**: Code splitting and lazy loading through Vite
- **Caching**: React Query provides intelligent caching for API responses
- **Compression**: Express middleware for response compression