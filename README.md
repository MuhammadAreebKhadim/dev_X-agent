
# VoiceDev X - Voice-Driven Coding Assistant

![VoiceDev X](https://img.shields.io/badge/VoiceDev%20X-Voice%20Coding%20Assistant-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)

## 🎯 Overview

VoiceDev X is a comprehensive full-stack web application that serves as a voice-driven coding assistant. Built with a VS Code-style interface, it allows developers to speak programming commands in multiple languages (English, Urdu, Hindi, Arabic, Spanish, French) and have them translated, processed by AI, and converted into working code. The system features a conversational AI assistant called "Dev X Assistant" that provides voice feedback and guides users through their coding journey.

## ✨ Key Features

### 🎤 Voice-Driven Interface
- **Multi-Language Voice Recognition**: Supports 6+ languages with real-time detection
- **Natural Language Processing**: Understands complex coding commands in plain English
- **Voice Output**: Dev X Assistant speaks responses and confirmations
- **Real-time Transcription**: Live speech-to-text with confidence indicators

### 📁 Advanced File Management
- **VS Code-Style Explorer**: Hierarchical folder structure with expand/collapse functionality
- **Voice-Controlled Creation**: "Make a file of CSS with name of style" → creates `style.css`
- **Smart File Detection**: Automatically detects file types and adds appropriate extensions
- **File Deletion**: Voice commands to delete files and folders
- **Real-time Sync**: Changes synchronized between frontend and backend

### 💻 Intelligent Code Editing
- **Syntax-Highlighted Editor**: Multi-language syntax highlighting with line numbers
- **Voice Code Generation**: Generate functions, classes, and complete applications
- **Live Code Modification**: Change existing code with voice commands
- **Function Management**: Add, remove, or replace specific functions
- **Line-by-Line Editing**: Modify individual lines with voice commands

### 🤖 AI-Powered Assistant
- **Conversational Interface**: Dev X Assistant greets users and confirms actions
- **Voice Responses**: Speaks all confirmations and status updates
- **Smart Suggestions**: Context-aware coding recommendations
- **Error Handling**: Graceful error recovery with helpful messages

### 🐛 Debug & Execution
- **Code Analysis**: Real-time code analysis with warnings and suggestions
- **Execution Simulation**: Run code with output display
- **Debug Information**: Line counts, function detection, variable analysis
- **Performance Metrics**: Code quality assessment

### 🚀 Deployment Ready
- **Full-Stack Integration**: Complete backend-frontend synchronization
- **Database Persistence**: PostgreSQL with Drizzle ORM
- **Production Configuration**: Ready for Replit deployment
- **Environment Management**: Automated environment variable setup

## 🛠 Technology Stack

### Frontend Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (Ultra-fast development and production builds)
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom VS Code theme
- **State Management**: TanStack Query (React Query v5) for server state
- **Routing**: Wouter (lightweight client-side routing)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React for consistent iconography

### Backend Technologies
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Architecture**: RESTful API with JSON responses
- **Validation**: Zod schemas for runtime type checking

### AI & Voice Technologies
- **Speech Recognition**: Web Speech API (browser-native)
- **Voice Synthesis**: Browser speechSynthesis API
- **Language Processing**: Enhanced pattern matching for multi-language support
- **Code Generation**: AI-powered code generation with context awareness
- **Translation**: Multi-language command interpretation

### Database Schema
```sql
-- Voice Commands Table
voice_commands (
  id: uuid PRIMARY KEY,
  original_text: text,
  translated_text: text,
  detected_language: varchar(10),
  confidence_score: decimal,
  created_at: timestamp
)

-- Code Generations Table
code_generations (
  id: uuid PRIMARY KEY,
  voice_command_id: uuid REFERENCES voice_commands(id),
  generated_code: text,
  language: varchar(50),
  file_name: varchar(255),
  approved: boolean,
  created_at: timestamp
)

-- Project Files Table
project_files (
  id: uuid PRIMARY KEY,
  name: varchar(255),
  path: varchar(500),
  content: text,
  file_type: varchar(50),
  created_at: timestamp,
  updated_at: timestamp
)
```

### Development Tools
- **Type Checking**: TypeScript with strict configuration
- **Hot Reload**: Vite HMR for instant development feedback
- **Code Quality**: ESLint and Prettier (implied by Vite setup)
- **Database Migrations**: Drizzle Kit for schema management
- **Development Server**: tsx for TypeScript execution

## 🎙 Voice Commands Reference

### File & Folder Management
```bash
# File Creation
"Make a file of CSS with name of style"           → style.css
"Create JavaScript file named calculator"         → calculator.js
"Make a Python file called main"                  → main.py

# Folder Management
"Create folder components"                         → components/
"Make folder utils"                               → utils/

# File Deletion
"Delete file style.css"                          → Removes file
"Remove folder components"                        → Removes folder
```

### Code Generation & Editing
```bash
# Function Creation
"Create a function that adds two numbers"
"Generate a user authentication function"
"Make a class for handling database connections"

# Code Modification
"Change the code to use arrow functions"
"Replace function calculateTotal with a new version"
"Update the code to include error handling"

# Line Editing
"Change line 5 to console.log('Hello World')"
"Modify line 10 to include type annotations"

# Function Management
"Remove function calculateTotal"
"Delete function handleSubmit"
```

### Debugging & Execution
```bash
"Debug code"                                      → Analyzes and runs code
"Run code"                                        → Executes current file
"Execute the program"                             → Runs with output display
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Modern web browser with microphone access

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd voicedev-x
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Database configuration (auto-configured on Replit)
DATABASE_URL=postgresql://username:password@localhost:5432/voicedev_x
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=voicedev_x
```

4. **Run database migrations**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:5000
```

## 📦 Deployment

### Replit Deployment (Recommended)

VoiceDev X is fully configured for one-click deployment on Replit:

1. **Click Deploy Button** in your Replit interface
2. **Choose Deployment Type**: 
   - Autoscale (recommended for production)
   - Reserved VM (for consistent performance)
3. **Environment Variables**: Automatically configured
4. **Database**: Replit PostgreSQL integration included
5. **Domain**: Provided as `your-app-name.replit.app`

### Manual Deployment

#### Build for Production
```bash
npm run build
```

#### Environment Variables Required
```bash
NODE_ENV=production
DATABASE_URL=your_postgresql_url
PGHOST=your_db_host
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
```

#### Deploy to Your Platform
```bash
# The application serves both frontend and backend on the same port
npm start
```

### Health Check Endpoints
- **Frontend**: `GET /` - Main application interface
- **Backend**: `GET /api/health` - API health status
- **Database**: Connection tested on startup

## 🏗 Project Structure

```
voicedev-x/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── enhanced-voice-input.tsx
│   │   │   ├── confirmation-dialog.tsx
│   │   │   └── code-preview.tsx
│   │   ├── pages/                   # Application pages
│   │   │   └── voice-dev.tsx        # Main voice interface
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── use-voice-recognition.tsx
│   │   │   ├── use-code-generation.tsx
│   │   │   └── use-toast.tsx
│   │   └── lib/                     # Utility libraries
│   │       └── queryClient.ts       # TanStack Query configuration
│   └── index.html                   # Entry HTML file
├── server/                          # Backend Express application
│   ├── index.ts                     # Main server file
│   ├── routes.ts                    # API route definitions
│   ├── storage.ts                   # Database interface
│   └── vite.ts                      # Vite integration
├── shared/                          # Shared types and schemas
│   └── schema.ts                    # Drizzle database schema
├── DEPLOYMENT_GUIDE.md              # Detailed deployment instructions
├── README.md                        # This file
├── package.json                     # Dependencies and scripts
├── vite.config.ts                   # Vite configuration
├── drizzle.config.ts               # Database configuration
├── tailwind.config.ts              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

## 🔌 API Endpoints

### Voice Processing
- `POST /api/voice-commands` - Store voice input
- `GET /api/voice-commands` - Retrieve command history
- `POST /api/generate-code` - Generate code from voice command
- `POST /api/code-generations` - Store generated code

### File Management
- `GET /api/files` - List project files
- `POST /api/files` - Create new file
- `PUT /api/files/:id` - Update file content
- `DELETE /api/files/:id` - Delete file

### System
- `GET /api/health` - Health check endpoint
- `GET /api/status` - System status information

## 🧪 Testing Voice Commands

### Test File Creation
1. Click the microphone button
2. Say: "Make a file of CSS with name of style"
3. Verify: `style.css` appears in file explorer

### Test Code Generation
1. Open a JavaScript file
2. Say: "Create a function that calculates the factorial of a number"
3. Verify: Function code is generated and can be approved

### Test Code Modification
1. Generate some code first
2. Say: "Change the code to use arrow functions"
3. Verify: Existing code is modified accordingly

### Test Debugging
1. Write or generate some code
2. Say: "Debug code"
3. Verify: Analysis appears in Settings → Debug section

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Voice Recognition Not Working**
- Ensure browser microphone permissions are granted
- Check if browser supports Web Speech API
- Try refreshing the page

**Code Not Saving**
- Verify database connection in backend logs
- Check environment variables are properly set
- Ensure PostgreSQL service is running

**Assistant Not Speaking**
- Check browser audio permissions
- Verify volume settings
- Try a different browser if issues persist

### Getting Help

1. Check the console for error messages
2. Review the deployment logs in Replit
3. Verify all environment variables are set correctly
4. Test API endpoints directly if needed

## 🔮 Future Enhancements

- **Advanced AI Integration**: Integration with GPT-4 or Claude for enhanced code generation
- **Multi-Project Support**: Handle multiple coding projects simultaneously
- **Version Control**: Git integration for code versioning
- **Collaborative Features**: Multi-user coding sessions
- **Plugin System**: Extensible architecture for custom commands
- **Mobile Support**: Progressive Web App capabilities

---

## 🎉 Ready to Deploy!

Your VoiceDev X application is fully integrated and production-ready. All components are connected, features are working, and the deployment configuration is complete.

**Deploy on Replit**: Simply click the Deploy button in your Replit interface.

**Custom Deployment**: Follow the manual deployment steps above.

Built with ❤️ by the VoiceDev X team



