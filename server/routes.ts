
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use('/uploads', (await import('express')).default.static(uploadsDir));

  app.post('/api/upload', (req, res) => {
    upload.single('photo')(req, res, (err) => {
      if (err) {
        const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large (max 10MB)'
          : err.message || 'Upload failed';
        return res.status(400).json({ message });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const url = `/uploads/${req.file.filename}`;
      res.json({ url });
    });
  });
  
  // === Pets ===
  app.get(api.pets.list.path, async (_req, res) => {
    const pets = await storage.getPets();
    res.json(pets);
  });

  app.get(api.pets.get.path, async (req, res) => {
    const pet = await storage.getPet(Number(req.params.id));
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  });

  app.post(api.pets.create.path, async (req, res) => {
    try {
      const input = api.pets.create.input.parse(req.body);
      const pet = await storage.createPet(input);
      res.status(201).json(pet);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.pets.update.path, async (req, res) => {
    try {
      const input = api.pets.update.input.parse(req.body);
      const pet = await storage.updatePet(Number(req.params.id), input);
      res.json(pet);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(404).json({ message: "Pet not found" });
    }
  });

  app.delete(api.pets.delete.path, async (req, res) => {
    await storage.deletePet(Number(req.params.id));
    res.status(204).end();
  });

  // === Medical Records ===
  app.get(api.records.list.path, async (req, res) => {
    const records = await storage.getRecords(Number(req.params.petId));
    res.json(records);
  });

  app.post(api.records.create.path, async (req, res) => {
    try {
      const input = api.records.create.input.parse(req.body);
      const record = await storage.createRecord(input);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.records.update.path, async (req, res) => {
    try {
      const input = api.records.update.input.parse(req.body);
      const record = await storage.updateRecord(Number(req.params.id), input);
      res.json(record);
    } catch (err) {
      res.status(404).json({ message: "Record not found" });
    }
  });

  app.delete(api.records.delete.path, async (req, res) => {
    await storage.deleteRecord(Number(req.params.id));
    res.status(204).end();
  });

  // === Reminders ===
  app.get(api.reminders.list.path, async (req, res) => {
    const petId = req.query.petId ? Number(req.query.petId) : undefined;
    const reminders = await storage.getReminders(petId);
    res.json(reminders);
  });

  app.post(api.reminders.create.path, async (req, res) => {
    try {
      const input = api.reminders.create.input.parse(req.body);
      // Ensure date is a Date object
      if (typeof input.dueDate === 'string') {
        input.dueDate = new Date(input.dueDate);
      }
      const reminder = await storage.createReminder(input);
      res.status(201).json(reminder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.reminders.update.path, async (req, res) => {
    try {
      const input = api.reminders.update.input.parse(req.body);
      if (input.dueDate && typeof input.dueDate === 'string') {
        input.dueDate = new Date(input.dueDate);
      }
      const reminder = await storage.updateReminder(Number(req.params.id), input);
      res.json(reminder);
    } catch (err) {
      res.status(404).json({ message: "Reminder not found" });
    }
  });

  app.delete(api.reminders.delete.path, async (req, res) => {
    await storage.deleteReminder(Number(req.params.id));
    res.status(204).end();
  });

  // === Backup ===
  app.get(api.backup.export.path, async (_req, res) => {
    const data = await storage.getFullBackup();
    res.json(data);
  });

  app.post(api.backup.import.path, async (req, res) => {
    try {
      // Basic validation that we have the keys
      const data = req.body;
      if (!Array.isArray(data.pets) || !Array.isArray(data.medicalRecords) || !Array.isArray(data.reminders)) {
        return res.status(400).json({ success: false, message: "Invalid backup format" });
      }
      await storage.importBackup(data);
      res.json({ success: true, message: "Backup imported successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Import failed" });
    }
  });

  // === Seed Data (on startup if empty) ===
  const existingPets = await storage.getPets();
  if (existingPets.length === 0) {
    const bella = await storage.createPet({
      name: "Bella",
      species: "Dog",
      breed: "Golden Retriever",
      birthDate: "2020-05-15",
      gender: "Female",
      weight: "28 kg",
      chipNumber: "981098109810",
      photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"
    });

    const luna = await storage.createPet({
      name: "Luna",
      species: "Cat",
      breed: "Siamese",
      birthDate: "2021-08-20",
      gender: "Female",
      weight: "4 kg",
      chipNumber: "123456789012",
      photoUrl: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80"
    });

    // Add some records for Bella
    const vax = await storage.createRecord({
      petId: bella.id,
      type: "vaccination",
      date: "2023-05-15",
      title: "Rabies & DHPP",
      doctor: "Dr. Smith",
      clinic: "Happy Paws Clinic",
      nextDueDate: "2024-05-15",
      notes: "Annual booster. Bella was very brave!",
      cost: "$120"
    });

    await storage.createReminder({
      petId: bella.id,
      recordId: vax.id,
      title: "Rabies Vaccine Due",
      dueDate: new Date("2024-05-15T09:00:00Z"),
      isCompleted: false,
      isRecurring: true,
      recurrenceInterval: "yearly"
    });

    await storage.createRecord({
      petId: bella.id,
      type: "prevention",
      date: "2023-11-01",
      title: "Heartworm Prevention",
      notes: "Given Heartgard Plus",
      nextDueDate: "2023-12-01"
    });
    
    // Add records for Luna
    await storage.createRecord({
      petId: luna.id,
      type: "visit",
      date: "2023-09-10",
      title: "Checkup - Ear Infection",
      doctor: "Dr. Jones",
      clinic: "City Vet",
      notes: "Prescribed ear drops twice daily for 7 days.",
      diagnosis: "Otitis Externa"
    } as any); // diagnosis field not in schema but useful to have noted in notes
  }

  return httpServer;
}
