import Link from 'next/link';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { OnboardingFooter } from '@/components/onboarding-footer';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <RingsLogo size={40} />
            <span className="font-display text-xl text-heading tracking-tight">
              love<span className="text-primary">2</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-sm text-muted hover:text-heading font-medium transition-colors"
            >
              Pular por enquanto
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 px-6 py-10">{children}</main>
      <OnboardingFooter />
    </div>
  );
}
