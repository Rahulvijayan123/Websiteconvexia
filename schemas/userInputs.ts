import { z } from 'zod';

export const UserInputSchema = z.object({
  therapeuticArea: z.string().min(2, 'Therapeutic area must be at least 2 characters'),
  indication: z.string().min(2, 'Indication must be at least 2 characters'),
  target: z.string().min(2, 'Target must be at least 2 characters'),
  geography: z.enum(['US', 'EU', 'JP', 'CN', 'Global'], {
    errorMap: () => ({ message: 'Geography must be one of: US, EU, JP, CN, Global' })
  }),
  developmentPhase: z.enum(['Pre-clinical', 'Phase 1', 'Phase 2', 'Phase 3', 'Filed'], {
    errorMap: () => ({ message: 'Development phase must be one of: Pre-clinical, Phase 1, Phase 2, Phase 3, Filed' })
  }),
  fullResearch: z.boolean().optional().default(false)
});

export type UserInputs = z.infer<typeof UserInputSchema>; 