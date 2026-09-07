'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { registerInput, type RegisterInput } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerInput),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await apiClient('/api/auth/register', { method: 'POST', body: JSON.stringify(values) });
      await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      toast.success('Conta criada. Vamos preparar seu perfil.');
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'EMAIL_TAKEN') toast.error('Este e-mail já está cadastrado.');
      else if (e.code === 'PHONE_TAKEN') toast.error('Este telefone já está cadastrado.');
      else toast.error(e.message ?? 'Erro ao criar conta.');
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <div className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg text-heading">
            <RingsLogo size={32} />
            LOVE Casal
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="type-eyebrow mb-3">— criar sua conta</p>
            <h1 className="font-display text-4xl text-heading tracking-tight mb-2">
              Bem-vinda(o).
            </h1>
            <p className="text-sm text-muted">Vai levar 1 minuto.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" autoComplete="name" {...register('name')} />
              {formState.errors.name && (
                <p className="text-xs text-danger">{formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {formState.errors.email && (
                <p className="text-xs text-danger">{formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com DDI)</Label>
              <Input
                id="phone"
                placeholder="+5511999999999"
                autoComplete="tel"
                {...register('phone')}
              />
              {formState.errors.phone && (
                <p className="text-xs text-danger">{formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {formState.errors.password && (
                <p className="text-xs text-danger">{formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Criando...' : 'Criar conta'}
            </Button>
            <p className="text-sm text-center text-muted pt-2">
              Já tem conta?{' '}
              <Link href="/entrar" className="text-primary hover:underline font-semibold">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
