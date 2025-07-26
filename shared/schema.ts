import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const voiceCommands = pgTable("voice_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  detectedLanguage: text("detected_language").notNull(),
  confidence: text("confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codeGenerations = pgTable("code_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commandId: varchar("command_id").references(() => voiceCommands.id),
  generatedCode: text("generated_code").notNull(),
  language: text("language").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  approved: boolean("approved").default(false),
  applied: boolean("applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectFiles = pgTable("project_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull(),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  createdAt: true,
});

export const insertCodeGenerationSchema = createInsertSchema(codeGenerations).omit({
  id: true,
  createdAt: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  lastModified: true,
});

export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;
export type VoiceCommand = typeof voiceCommands.$inferSelect;

export type InsertCodeGeneration = z.infer<typeof insertCodeGenerationSchema>;
export type CodeGeneration = typeof codeGenerations.$inferSelect;

export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;

// Define relations
export const voiceCommandsRelations = relations(voiceCommands, ({ many }) => ({
  codeGenerations: many(codeGenerations),
}));

export const codeGenerationsRelations = relations(codeGenerations, ({ one }) => ({
  voiceCommand: one(voiceCommands, {
    fields: [codeGenerations.commandId],
    references: [voiceCommands.id],
  }),
}));
