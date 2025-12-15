import { z } from 'zod';

export const CreateBookingSchema = z
  .object({
    userId: z.string().cuid(),
    pickupLocationId: z.string().cuid(),
    startDate: z.date().min(new Date()),
    endDate: z.date(),
    equipmentItem: z
      .array(
        z.object({
          equipmentInstanceId: z.string().cuid(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
  });
