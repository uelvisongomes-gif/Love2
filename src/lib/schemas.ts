import { z } from 'zod';

export const registerInput = z.object({
  name: z.string().min(2, 'nome muito curto').max(80),
  email: z.string().email('e-mail inválido').toLowerCase(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'telefone em formato internacional, ex: +5511999999999'),
  password: z
    .string()
    .min(10, 'senha precisa ter ao menos 10 caracteres')
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
