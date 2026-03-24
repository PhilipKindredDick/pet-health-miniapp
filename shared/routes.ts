
import { z } from 'zod';
import { 
  insertPetSchema, 
  insertRecordSchema, 
  insertReminderSchema,
  pets,
  medicalRecords,
  reminders
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  pets: {
    list: {
      method: 'GET' as const,
      path: '/api/pets',
      responses: {
        200: z.array(z.custom<typeof pets.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/pets/:id',
      responses: {
        200: z.custom<typeof pets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pets',
      input: insertPetSchema,
      responses: {
        201: z.custom<typeof pets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/pets/:id',
      input: insertPetSchema.partial(),
      responses: {
        200: z.custom<typeof pets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/pets/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  records: {
    list: {
      method: 'GET' as const,
      path: '/api/pets/:petId/records',
      responses: {
        200: z.array(z.custom<typeof medicalRecords.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/records',
      input: insertRecordSchema,
      responses: {
        201: z.custom<typeof medicalRecords.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/records/:id',
      input: insertRecordSchema.partial(),
      responses: {
        200: z.custom<typeof medicalRecords.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/records/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  reminders: {
    list: {
      method: 'GET' as const,
      path: '/api/reminders', // Global list or filter by petId in query
      input: z.object({ petId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof reminders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reminders',
      input: insertReminderSchema,
      responses: {
        201: z.custom<typeof reminders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reminders/:id',
      input: insertReminderSchema.partial(),
      responses: {
        200: z.custom<typeof reminders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/reminders/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  backup: {
    export: {
      method: 'GET' as const,
      path: '/api/backup/export',
      responses: {
        200: z.object({
          pets: z.array(z.custom<typeof pets.$inferSelect>()),
          medicalRecords: z.array(z.custom<typeof medicalRecords.$inferSelect>()),
          reminders: z.array(z.custom<typeof reminders.$inferSelect>()),
        }),
      },
    },
    import: {
      method: 'POST' as const,
      path: '/api/backup/import',
      input: z.object({
        pets: z.array(z.custom<typeof pets.$inferSelect>()),
        medicalRecords: z.array(z.custom<typeof medicalRecords.$inferSelect>()),
        reminders: z.array(z.custom<typeof reminders.$inferSelect>()),
      }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
