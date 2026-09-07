import Link from 'next/link';
import { LogoutButton } from './logout-button';

export function AppHeader() {
  return (
    <header className="w-full px-6 py-3 flex justify-between items-center border-b bg-background">
      <Link href="/home" className="text-lg font-semibold tracking-tight">
        LOVE Casal
      </Link>
      <LogoutButton />
    </header>
  );
}
