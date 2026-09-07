'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  confirmPasswordResetInput,
  requestPasswordResetInput,
  type ConfirmPasswordResetInput,
  type RequestPasswordResetInput,
} from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'email' | 'code';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');

  const emailForm = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetInput),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<ConfirmPasswordResetInput>({
    resolver: zodResolver(confirmPasswordResetInput),
    defaultValues: { email: '', code: '', newPassword: '' },
  });

  async function onRequestSubmit(values: RequestPasswordResetInput) {
    try {
      await apiClient('/api/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setEmail(values.email);
      codeForm.setValue('email', values.email);
      setStep('code');
      toast.success('Se este e-mail estiver cadastrado, um código foi enviado.');
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e.message ?? 'Erro ao pedir código.');
    }
  }

  async function onConfirmSubmit(values: ConfirmPasswordResetInput) {
    try {
      await apiClient('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Senha redefinida! Agora entra com a senha nova.');
      router.push('/entrar');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_RESET') toast.error('Código inválido ou expirado.');
      else toast.error(e.message ?? 'Erro ao redefinir senha.');
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <div className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg text-heading">
            <RingsLogo size={32} />
            love2
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="type-eyebrow mb-3">— recuperar senha</p>
            <h1 className="font-display text-4xl text-heading tracking-tight mb-2">
              {step === 'email' ? 'Sem problema.' : 'Chegou o código?'}
            </h1>
            <p className="text-sm text-muted">
              {step === 'email'
                ? 'Vamos te mandar um código por e-mail.'
                : `Digite o código de 6 dígitos que enviamos para ${email}.`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(onRequestSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...emailForm.register('email')}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-danger">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={emailForm.formState.isSubmitting}
              >
                {emailForm.formState.isSubmitting ? 'Enviando...' : 'Enviar código'}
              </Button>
              <p className="text-sm text-center text-muted pt-2">
                Lembrou?{' '}
                <Link href="/entrar" className="text-primary hover:underline font-semibold">
                  Voltar pra entrar
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={codeForm.handleSubmit(onConfirmSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="code">Código (6 dígitos)</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  {...codeForm.register('code')}
                />
                {codeForm.formState.errors.code && (
                  <p className="text-xs text-danger">{codeForm.formState.errors.code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...codeForm.register('newPassword')}
                />
                {codeForm.formState.errors.newPassword && (
                  <p className="text-xs text-danger">
                    {codeForm.formState.errors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-muted">
                  Mínimo 6 caracteres, com 1 maiúscula, 1 minúscula e 1 número.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={codeForm.formState.isSubmitting}
              >
                {codeForm.formState.isSubmitting ? 'Salvando...' : 'Redefinir senha'}
              </Button>
              <p className="text-sm text-center text-muted pt-2">
                <button
                  type="button"
                  className="hover:text-primary hover:underline"
                  onClick={() => setStep('email')}
                >
                  Não recebi — enviar de novo
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
