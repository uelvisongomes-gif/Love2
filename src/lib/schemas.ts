import { z } from 'zod';

export const registerInput = z.object({
  name: z.string().min(2, 'nome muito curto').max(80),
  email: z.string().email('e-mail inválido').toLowerCase(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'telefone em formato internacional, ex: +5511999999999'),
  password: z
    .string()
    .min(6, 'senha precisa ter ao menos 6 caracteres')
    .regex(/[A-Z]/, 'inclua uma letra maiúscula')
    .regex(/[a-z]/, 'inclua uma letra minúscula')
    .regex(/\d/, 'inclua um número'),
});
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({
  email: z.string().email('e-mail inválido').toLowerCase(),
  password: z.string().min(1, 'senha obrigatória'),
});
export type LoginInput = z.infer<typeof loginInput>;

// ============ Onboarding ============
import { LOVE_LANGUAGES, PILLARS } from './love-languages';

export const profileStep1 = z.object({
  relationshipYears: z.coerce.number().int().min(0).max(80),
  hasChildren: z.boolean(),
  livingTogether: z.boolean(),
  timezone: z.string().min(1),
});
export type ProfileStep1 = z.infer<typeof profileStep1>;

export const profileStep2 = z.object({
  loveLanguagesRanking: z.array(z.enum(LOVE_LANGUAGES)).length(5),
});
export type ProfileStep2 = z.infer<typeof profileStep2>;

const pillarScore = z.number().int().min(0).max(10);
export const profileStep3 = z.object({
  pillarScores: z.object({
    financeiro: pillarScore,
    comunicacao: pillarScore,
    intimidade: pillarScore,
    filhos: pillarScore,
    tarefas: pillarScore,
    papeis: pillarScore,
    espiritualidade: pillarScore,
  }),
});
export type ProfileStep3 = z.infer<typeof profileStep3>;

export const profileStep4 = z.object({
  preferences: z.object({
    religion: z.string().max(40).nullable(),
    religionOptIn: z.boolean(),
    politicsOptIn: z.boolean(),
    avoidedTopics: z.array(z.enum(PILLARS)).default([]),
  }),
});
export type ProfileStep4 = z.infer<typeof profileStep4>;

export const safetyScreeningStep = z.object({
  hasViolenceHistory: z.boolean(),
  hasSuicidalIdeation: z.boolean(),
  hasSubstanceAbuse: z.boolean(),
  hasChildSafetyConcerns: z.boolean(),
  acceptDisclaimer: z.literal(true, { errorMap: () => ({ message: 'Aceite o disclaimer pra continuar.' }) }),
});
export type SafetyScreeningStep = z.infer<typeof safetyScreeningStep>;
