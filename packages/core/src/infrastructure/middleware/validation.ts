import { z } from 'zod';

type SafeParseSuccess<Output> = {
  success: true;
  data: Output;
  error?: undefined;
};

export function validateRequest(
  schema: z.ZodSchema,
  data: unknown,
): z.SafeParseSuccess<SafeParseSuccess<unknown>> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid request data');
  }
  return result.data;
}
