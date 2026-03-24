
import { pgTable, text, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  passportName: text("passport_name"),
  species: text("species").notNull(), // Dog, Cat, etc.
  breed: text("breed"),
  birthDate: date("birth_date"), // ISO date string
  gender: text("gender").default("unknown"),
  weight: text("weight"), // stored as string to allow units e.g. "5 kg"
  chipNumber: text("chip_number"),
  photoUrl: text("photo_url"),
});

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  type: text("type").notNull(), // vaccination, visit, surgery, prevention, medication
  date: date("date").notNull(),
  title: text("title").notNull(), // e.g. "Rabies Vaccine" or "Annual Checkup"
  doctor: text("doctor"),
  clinic: text("clinic"),
  notes: text("notes"),
  nextDueDate: date("next_due_date"), // For automated reminders
  cost: text("cost"),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  title: text("title").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  recordId: integer("record_id"), // Optional link to a medical record
  isRecurring: boolean("is_recurring").default(false),
  recurrenceInterval: text("recurrence_interval"), // e.g., "yearly", "monthly"
});

// === RELATIONS ===

export const petsRelations = relations(pets, ({ many }) => ({
  records: many(medicalRecords),
  reminders: many(reminders),
}));

export const recordsRelations = relations(medicalRecords, ({ one, many }) => ({
  pet: one(pets, {
    fields: [medicalRecords.petId],
    references: [pets.id],
  }),
  reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  pet: one(pets, {
    fields: [reminders.petId],
    references: [pets.id],
  }),
  record: one(medicalRecords, {
    fields: [reminders.recordId],
    references: [medicalRecords.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertPetSchema = createInsertSchema(pets).omit({ id: true });
export const insertRecordSchema = createInsertSchema(medicalRecords).omit({ id: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true }).extend({
  dueDate: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

// === EXPLICIT API CONTRACT TYPES ===

export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertRecordSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

// Request types
export type CreatePetRequest = InsertPet;
export type UpdatePetRequest = Partial<InsertPet>;

export type CreateRecordRequest = InsertMedicalRecord;
export type UpdateRecordRequest = Partial<InsertMedicalRecord>;

export type CreateReminderRequest = InsertReminder;
export type UpdateReminderRequest = Partial<InsertReminder>;

// Export/Import types
export type FullBackup = {
  pets: Pet[];
  medicalRecords: MedicalRecord[];
  reminders: Reminder[];
};
