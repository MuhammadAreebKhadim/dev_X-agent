import { 
  type VoiceCommand, 
  type InsertVoiceCommand,
  type CodeGeneration,
  type InsertCodeGeneration,
  type ProjectFile,
  type InsertProjectFile,
  voiceCommands,
  codeGenerations,
  projectFiles
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Voice Commands
  createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
  getVoiceCommands(): Promise<VoiceCommand[]>;
  
  // Code Generations
  createCodeGeneration(generation: InsertCodeGeneration): Promise<CodeGeneration>;
  getCodeGenerations(): Promise<CodeGeneration[]>;
  updateCodeGeneration(id: string, updates: Partial<CodeGeneration>): Promise<CodeGeneration>;
  
  // Project Files
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  getProjectFiles(): Promise<ProjectFile[]>;
  updateProjectFile(id: string, updates: Partial<ProjectFile>): Promise<ProjectFile>;
  getProjectFileByPath(filePath: string): Promise<ProjectFile | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createVoiceCommand(insertCommand: InsertVoiceCommand): Promise<VoiceCommand> {
    const [command] = await db
      .insert(voiceCommands)
      .values(insertCommand)
      .returning();
    return command;
  }

  async getVoiceCommands(): Promise<VoiceCommand[]> {
    return await db
      .select()
      .from(voiceCommands)
      .orderBy(desc(voiceCommands.createdAt));
  }

  async createCodeGeneration(insertGeneration: InsertCodeGeneration): Promise<CodeGeneration> {
    const [generation] = await db
      .insert(codeGenerations)
      .values({
        ...insertGeneration,
        commandId: insertGeneration.commandId || null,
      })
      .returning();
    return generation;
  }

  async getCodeGenerations(): Promise<CodeGeneration[]> {
    return await db
      .select()
      .from(codeGenerations)
      .orderBy(desc(codeGenerations.createdAt));
  }

  async updateCodeGeneration(id: string, updates: Partial<CodeGeneration>): Promise<CodeGeneration> {
    const [updated] = await db
      .update(codeGenerations)
      .set(updates)
      .where(eq(codeGenerations.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Code generation with id ${id} not found`);
    }
    return updated;
  }

  async createProjectFile(insertFile: InsertProjectFile): Promise<ProjectFile> {
    const [file] = await db
      .insert(projectFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getProjectFiles(): Promise<ProjectFile[]> {
    return await db
      .select()
      .from(projectFiles)
      .orderBy(desc(projectFiles.lastModified));
  }

  async updateProjectFile(id: string, updates: Partial<ProjectFile>): Promise<ProjectFile> {
    const [updated] = await db
      .update(projectFiles)
      .set({
        ...updates,
        lastModified: new Date(),
      })
      .where(eq(projectFiles.id, id))
      .returning();
      
    if (!updated) {
      throw new Error(`Project file with id ${id} not found`);
    }
    return updated;
  }

  async getProjectFileByPath(filePath: string): Promise<ProjectFile | undefined> {
    const [file] = await db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.filePath, filePath));
    return file || undefined;
  }
}

export const storage = new DatabaseStorage();
