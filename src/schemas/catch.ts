import { z } from 'zod';
export const CatchSchema = z.object({ species: z.string(), weight: z.number().min(0), location: z.object({ lat: z.number(), lng: z.number() }) });