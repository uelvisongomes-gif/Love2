'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Escuta gestos de swipe da borda esquerda pra direita e chama router.back().
 * Ativo só em mobile (viewport < 768px).
 */
export function SwipeBack(): null {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let active = false;

    const EDGE = 30; // px da borda esquerda pra iniciar
    const MIN_DIST = 80; // px pra contar como swipe
    const MAX_TIME = 500; // ms

    function onStart(e: TouchEvent): void {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX > EDGE) return;
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();
      active = true;
    }

    function onEnd(e: TouchEvent): void {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      const dt = Date.now() - startTime;
      if (dx >= MIN_DIST && dy < 60 && dt < MAX_TIME) {
        router.back();
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [router]);

  return null;
}
