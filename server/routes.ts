import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoiceCommandSchema, insertCodeGenerationSchema, insertProjectFileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Voice Commands
  app.post("/api/voice-commands", async (req, res) => {
    try {
      const command = insertVoiceCommandSchema.parse(req.body);
      const result = await storage.createVoiceCommand(command);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid voice command data" });
    }
  });

  app.get("/api/voice-commands", async (req, res) => {
    const commands = await storage.getVoiceCommands();
    res.json(commands);
  });

  // Code Generations
  app.post("/api/code-generations", async (req, res) => {
    try {
      const generation = insertCodeGenerationSchema.parse(req.body);
      const result = await storage.createCodeGeneration(generation);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid code generation data" });
    }
  });

  app.get("/api/code-generations", async (req, res) => {
    const generations = await storage.getCodeGenerations();
    res.json(generations);
  });

  app.patch("/api/code-generations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const result = await storage.updateCodeGeneration(id, updates);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: "Code generation not found" });
    }
  });

  // Enhanced AI Code Generation with comprehensive voice command processing
  app.post("/api/generate-code", async (req, res) => {
    const { prompt, language, fileName } = req.body;
    
    // Enhanced file creation detection and processing (outside try block for scope)
    const fileCreationResult = detectAndProcessFileCreation(prompt);
    
    try {
      const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ENV_VAR || "";
      
      if (!groqApiKey) {
        // Fallback to mock implementation for demo
        const mockCode = generateMockCode(prompt, fileCreationResult.detectedLanguage || language);
        res.json({
          code: mockCode,
          language: fileCreationResult.detectedLanguage || language,
          fileName: fileCreationResult.fileName || fileName,
          confidence: 0.85,
          fileExtension: fileCreationResult.fileExtension,
          isFileCreation: fileCreationResult.isFileCreation
        });
        return;
      }

      // Process different types of voice commands
      const processedPrompt = processVoiceCommand(prompt, fileCreationResult.detectedLanguage || language);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `You are a voice-driven code generation assistant. Generate clean, well-commented code based on natural voice commands. 
              
              Guidelines:
              - Generate only the requested code construct (function, variable, loop, etc.)
              - Use proper indentation and formatting
              - Add minimal but helpful comments
              - Respond with code only, no explanations or markdown
              - Handle various constructs: functions, variables, loops, conditionals, classes, imports, etc.
              - If user asks for file operations, generate appropriate file handling code
              - For deployment or workflow commands, generate setup/configuration code
              `
            },
            {
              role: "user",
              content: processedPrompt
            }
          ],
          max_tokens: 1024,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedCode = data.choices[0]?.message?.content || "";

      res.json({
        code: generatedCode,
        language: fileCreationResult.detectedLanguage || language,
        fileName: fileCreationResult.fileName || fileName,
        confidence: 0.94,
        fileExtension: fileCreationResult.fileExtension,
        isFileCreation: fileCreationResult.isFileCreation
      });
    } catch (error) {
      console.error("Code generation error:", error);
      // Fallback to mock implementation
      const mockCode = generateMockCode(prompt, fileCreationResult.detectedLanguage || language);
      res.json({
        code: mockCode,
        language: fileCreationResult.detectedLanguage || language,
        fileName: fileCreationResult.fileName || fileName,
        confidence: 0.75,
        fileExtension: fileCreationResult.fileExtension,
        isFileCreation: fileCreationResult.isFileCreation
      });
    }
  });

  // Enhanced file creation detection and processing
  function detectAndProcessFileCreation(prompt: string): {
    isFileCreation: boolean;
    fileName: string | null;
    detectedLanguage: string | null;
    fileExtension: string | null;
  } {
    const lowerPrompt = prompt.toLowerCase();
    
    // Language mapping with file extensions
    const languageExtensions: Record<string, string> = {
      'python': '.py',
      'javascript': '.js',
      'java': '.java',
      'html': '.html',
      'css': '.css',
      'typescript': '.ts',
      'react': '.jsx',
      'php': '.php',
      'c++': '.cpp',
      'c': '.c',
      'go': '.go',
      'rust': '.rs',
      'ruby': '.rb',
      'swift': '.swift',
      'kotlin': '.kt',
      'dart': '.dart',
      'sql': '.sql',
      'json': '.json',
      'xml': '.xml',
      'yaml': '.yaml',
      'yml': '.yml'
    };

    // Check if it's a file creation command
    const fileCreationPatterns = [
      /create.*file.*with.*name/i,
      /make.*file.*named/i,
      /create.*file.*called/i,
      /generate.*file.*with.*name/i,
      /new.*file.*named/i,
      /build.*file.*called/i
    ];

    const isFileCreation = fileCreationPatterns.some(pattern => pattern.test(prompt));
    
    if (!isFileCreation) {
      return {
        isFileCreation: false,
        fileName: null,
        detectedLanguage: null,
        fileExtension: null
      };
    }

    // Extract language from prompt
    let detectedLanguage: string | null = null;
    for (const [lang, ext] of Object.entries(languageExtensions)) {
      if (lowerPrompt.includes(lang)) {
        detectedLanguage = lang;
        break;
      }
    }

    // Extract file name from prompt
    let fileName: string | null = null;
    
    // Enhanced patterns to extract file name - specifically "name of X" pattern
    const namePatterns = [
      // "make a java file with the name of app" -> extract "app"
      /(?:make|create)\s+(?:a\s+)?(\w+)\s+file\s+with\s+(?:the\s+)?name\s+of\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
      // "create a python file named calculator" -> extract "calculator"
      /(?:create|make)\s+(?:a\s+)?(\w+)\s+file\s+(?:named|called)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
      // "make css file with name style" -> extract "style"
      /make\s+(\w+)\s+file\s+with\s+name\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
      // General patterns
      /(?:name|named|called)\s+(?:of\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/i,
      /with\s+name\s+(?:of\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/i,
    ];

    for (const pattern of namePatterns) {
      const match = prompt.match(pattern);
      if (match) {
        if (match.length === 3 && match[2]) {
          // Pattern with both language and file name
          fileName = match[2];
          // Also update detected language if not found yet
          if (!detectedLanguage && match[1]) {
            const langFromPattern = match[1].toLowerCase();
            if (languageExtensions[langFromPattern]) {
              detectedLanguage = langFromPattern;
            }
          }
          break;
        } else if (match[1]) {
          fileName = match[1];
          break;
        }
      }
    }

    // Get file extension and create full file name
    const fileExtension = detectedLanguage ? languageExtensions[detectedLanguage] : null;
    
    // If we have both fileName and extension, combine them
    if (fileName && fileExtension) {
      fileName = fileName.includes('.') ? fileName : `${fileName}${fileExtension}`;
    }
    
    // Combine filename with extension if both are found
    if (fileName && fileExtension && !fileName.includes('.')) {
      fileName = fileName + fileExtension;
    }

    return {
      isFileCreation,
      fileName,
      detectedLanguage,
      fileExtension
    };
  }

  // Process voice commands to better understand intent
  function processVoiceCommand(prompt: string, language: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect command type and enhance the prompt
    if (lowerPrompt.includes('function') || lowerPrompt.includes('method')) {
      return `Create a ${language} function based on: "${prompt}". Include proper parameters, return value, and documentation.`;
    }
    
    if (lowerPrompt.includes('variable') || lowerPrompt.includes('declare')) {
      return `Create a ${language} variable declaration based on: "${prompt}". Use appropriate data type and initialization.`;
    }
    
    if (lowerPrompt.includes('loop') || lowerPrompt.includes('for') || lowerPrompt.includes('while')) {
      return `Create a ${language} loop based on: "${prompt}". Include proper iteration logic and body.`;
    }
    
    if (lowerPrompt.includes('if') || lowerPrompt.includes('condition') || lowerPrompt.includes('conditional')) {
      return `Create a ${language} conditional statement based on: "${prompt}". Include proper condition and logic.`;
    }
    
    if (lowerPrompt.includes('class') || lowerPrompt.includes('object')) {
      return `Create a ${language} class based on: "${prompt}". Include constructor, properties, and methods as appropriate.`;
    }
    
    if (lowerPrompt.includes('import') || lowerPrompt.includes('include') || lowerPrompt.includes('require')) {
      return `Create ${language} import/include statements based on: "${prompt}". Use proper syntax for the language.`;
    }
    
    if (lowerPrompt.includes('file') && (lowerPrompt.includes('create') || lowerPrompt.includes('make'))) {
      return `Generate ${language} code to create and handle files based on: "${prompt}". Include proper file operations.`;
    }
    
    if (lowerPrompt.includes('deploy') || lowerPrompt.includes('workflow') || lowerPrompt.includes('setup')) {
      return `Generate ${language} deployment or setup code based on: "${prompt}". Include configuration and necessary steps.`;
    }
    
    if (lowerPrompt.includes('debug') || lowerPrompt.includes('fix') || lowerPrompt.includes('error')) {
      return `Generate ${language} debugging or error handling code based on: "${prompt}". Include proper error handling and logging.`;
    }
    
    // Default enhancement
    return `Generate ${language} code for: "${prompt}". Create clean, well-structured code with appropriate comments.`;
  }

  // Mock code generation for demo purposes
  function generateMockCode(prompt: string, language: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (language.toLowerCase() === 'python') {
      return generatePythonMockCode(lowerPrompt);
    } else if (language.toLowerCase() === 'javascript') {
      return generateJavaScriptMockCode(lowerPrompt);
    } else if (language.toLowerCase() === 'java') {
      return generateJavaMockCode(lowerPrompt);
    } else {
      return `// Generated code for: ${prompt}\n// Language: ${language}\n\n// Code implementation would go here`;
    }
  }

  function generatePythonMockCode(prompt: string): string {
    if (prompt.includes('function') && prompt.includes('add')) {
      return `def add_numbers(a, b):
    """Add two numbers and return the result"""
    return a + b`;
    }
    
    if (prompt.includes('variable')) {
      return `# Variable declaration
my_variable = "Hello, World!"
number_var = 42
is_active = True`;
    }
    
    if (prompt.includes('loop') || prompt.includes('for')) {
      return `# For loop example
for i in range(10):
    print(f"Iteration: {i}")`;
    }
    
    if (prompt.includes('class')) {
      return `class MyClass:
    """A simple class example"""
    
    def __init__(self, name):
        self.name = name
    
    def greet(self):
        return f"Hello, {self.name}!"`;
    }
    
    if (prompt.includes('if') || prompt.includes('condition')) {
      return `# Conditional statement
if condition:
    print("Condition is true")
elif another_condition:
    print("Another condition is true")
else:
    print("No conditions are true")`;
    }
    
    if (prompt.includes('deploy') || prompt.includes('workflow')) {
      return `# Deployment and workflow setup
# Requirements file
# pip install flask gunicorn

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# Run with: gunicorn app:app`;
    }
    
    if (prompt.includes('connect') && prompt.includes('file')) {
      return `# Project structure and file connections
import os
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

# Import modules
from utils import helper_functions
from config import settings
from models import database

def main():
    """Main application entry point"""
    print("All files connected successfully")
    
if __name__ == "__main__":
    main()`;
    }
    
    return `# Python code generated from voice command
# Command: ${prompt}

def main():
    """Main function"""
    pass

if __name__ == "__main__":
    main()`;
  }

  function generateJavaScriptMockCode(prompt: string): string {
    if (prompt.includes('function') && prompt.includes('add')) {
      return `function addNumbers(a, b) {
    // Add two numbers and return the result
    return a + b;
}`;
    }
    
    if (prompt.includes('variable')) {
      return `// Variable declarations
const myVariable = "Hello, World!";
let numberVar = 42;
let isActive = true;`;
    }
    
    if (prompt.includes('loop') || prompt.includes('for')) {
      return `// For loop example
for (let i = 0; i < 10; i++) {
    console.log(\`Iteration: \${i}\`);
}`;
    }
    
    if (prompt.includes('class')) {
      return `class MyClass {
    constructor(name) {
        this.name = name;
    }
    
    greet() {
        return \`Hello, \${this.name}!\`;
    }
}`;
    }
    
    return `// JavaScript code generated from voice command
// Command: ${prompt}

function main() {
    // Main function
}

main();`;
  }

  function generateJavaMockCode(prompt: string): string {
    if (prompt.includes('function') || prompt.includes('method')) {
      return `public static int addNumbers(int a, int b) {
    // Add two numbers and return the result
    return a + b;
}`;
    }
    
    if (prompt.includes('class')) {
      return `public class MyClass {
    private String name;
    
    public MyClass(String name) {
        this.name = name;
    }
    
    public String greet() {
        return "Hello, " + this.name + "!";
    }
}`;
    }
    
    return `// Java code generated from voice command
// Command: ${prompt}

public class Main {
    public static void main(String[] args) {
        // Main method
    }
}`;
  }

  // Enhanced Translation service with comprehensive language support
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, fromLanguage } = req.body;
      
      // Comprehensive translation dictionary for voice commands
      const translations: Record<string, string> = {
        // Urdu commands
        "ایک فنکشن بناؤ جو دو نمبروں کا مجموعہ نکالے": "Create a function that adds two numbers",
        "پائتھن میں لکھو": "write in Python",
        "جاوا میں لکھو": "write in Java", 
        "جاوا اسکرپٹ میں لکھو": "write in JavaScript",
        "نئی فائل بناؤ": "create new file",
        "ڈیبگ کرو": "debug this",
        "ویری ایبل بناؤ": "create a variable",
        "لوپ بناؤ": "create a loop",
        "کنڈیشن لگاؤ": "add a condition",
        "کلاس بناؤ": "create a class",
        "ایپ ڈوٹ پائی فائل": "app.py file",
        "ایپ ڈوٹ جے ایس فائل": "app.js file",
        "ایپ ڈوٹ جاوا فائل": "app.java file",
        "فار لوپ": "for loop",
        "وائل لوپ": "while loop",
        "اف کنڈیشن": "if condition",
        "الس کنڈیشن": "else condition",
        "ٹرای کیچ": "try catch",
        "امپورٹ": "import",
        "ایکسپورٹ": "export",
        "پرنٹ": "print",
        "کنسول لاگ": "console log",
        "ری ٹرن": "return",
        
        // Hindi commands  
        "एक फंक्शन बनाओ जो दो संख्याओं को जोड़े": "Create a function that adds two numbers",
        "पायथन में लिखो": "write in Python",
        "जावा में लिखो": "write in Java",
        "जावास्क्रिप्ट में लिखो": "write in JavaScript", 
        "नई फाइल बनाओ": "create new file",
        "डिबग करो": "debug this",
        "वेरिएबल बनाओ": "create a variable",
        "लूप बनाओ": "create a loop",
        "कंडीशन लगाओ": "add a condition",
        "क्लास बनाओ": "create a class",
        
        // Arabic commands
        "إنشاء دالة تجمع رقمين": "Create a function that adds two numbers",
        "اكتب في بايثون": "write in Python",
        "اكتب في جافا": "write in Java",
        "إنشاء ملف جديد": "create new file",
        "تصحيح هذا": "debug this",
        "إنشاء متغير": "create a variable",
        "إنشاء حلقة": "create a loop",
        
        // Spanish commands
        "crear una función que sume dos números": "Create a function that adds two numbers",
        "escribir en Python": "write in Python", 
        "escribir en Java": "write in Java",
        "crear nuevo archivo": "create new file",
        "depurar esto": "debug this",
        "crear una variable": "create a variable",
        "crear un bucle": "create a loop",
        "agregar una condición": "add a condition",
        
        // French commands
        "créer une fonction qui additionne deux nombres": "Create a function that adds two numbers",
        "écrire en Python": "write in Python",
        "écrire en Java": "write in Java", 
        "créer un nouveau fichier": "create new file",
        "déboguer ceci": "debug this",
        "créer une variable": "create a variable",
        "créer une boucle": "create a loop"
      };

      const translatedText = translations[text] || text;
      
      // Detect language if not provided
      let detectedLanguage = fromLanguage || 'en';
      if (!fromLanguage) {
        if (/[\u0600-\u06FF]/.test(text)) detectedLanguage = 'ar';
        else if (/[\u0900-\u097F]/.test(text)) detectedLanguage = 'hi'; 
        else if (/[\u0590-\u05FF]/.test(text)) detectedLanguage = 'he';
        else if (/[ñáéíóúü]/.test(text.toLowerCase())) detectedLanguage = 'es';
        else if (/[àâäéèêëïîôöùûüÿç]/.test(text.toLowerCase())) detectedLanguage = 'fr';
        else if (/[\u0627-\u06FF]/.test(text)) detectedLanguage = 'ur';
      }
      
      res.json({
        originalText: text,
        translatedText,
        detectedLanguage,
        confidence: translations[text] ? 0.95 : 0.70
      });
    } catch (error) {
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Project Files
  app.post("/api/project-files", async (req, res) => {
    try {
      const file = insertProjectFileSchema.parse(req.body);
      const result = await storage.createProjectFile(file);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid project file data" });
    }
  });

  app.get("/api/project-files", async (req, res) => {
    const files = await storage.getProjectFiles();
    res.json(files);
  });

  app.patch("/api/project-files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const result = await storage.updateProjectFile(id, updates);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: "Project file not found" });
    }
  });

  // Download endpoint for project archive
  app.get("/download/voicedev-x-project.tar.gz", (req, res) => {
    const filePath = "/home/runner/workspace/voicedev-x-project.tar.gz";
    res.download(filePath, "voicedev-x-project.tar.gz", (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(404).send("File not found");
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
