import Link from 'next/link';
import { HeartHandshake, Phone } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CareModePage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <p className="type-eyebrow mb-3">— seu cuidado vem primeiro</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">
          Obrigada por ter <em className="text-primary italic">contado</em>.
        </h1>
        <p className="mt-4 text-text font-medium leading-relaxed">
          Pelo que você compartilhou, o caminho mais seguro agora não é uma conversa mediada por app — é apoio humano especializado. A LOVE não substitui esse cuidado.
        </p>
      </div>

      <div className="rounded-lg border border-primary/40 bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <HeartHandshake className="w-5 h-5" />
          <h2 className="font-display italic text-xl">Onde procurar ajuda agora</h2>
        </div>
        <ul className="space-y-3 text-sm text-text font-medium">
          <li className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted shrink-0" />
            <div>
              <strong className="text-heading">CVV</strong> — Centro de Valorização da Vida:{' '}
              <span className="font-display italic text-primary text-base">188</span> (24h, ligação gratuita)
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted shrink-0" />
            <div>
              <strong className="text-heading">Central de Atendimento à Mulher</strong>:{' '}
              <span className="font-display italic text-primary text-base">180</span> (24h)
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted shrink-0" />
            <div>
              <strong className="text-heading">SAMU</strong>:{' '}
              <span className="font-display italic text-primary text-base">192</span> · <strong className="text-heading">Polícia</strong>:{' '}
              <span className="font-display italic text-primary text-base">190</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <HeartHandshake className="w-4 h-4 mt-0.5 text-muted shrink-0" />
            <div>
              Um(a) <strong className="text-heading">psicólogo(a)</strong> ou{' '}
              <strong className="text-heading">terapeuta de casal</strong> presencial ou por telemedicina.
            </div>
          </li>
        </ul>
      </div>

      <p className="text-sm text-text font-medium">
        Você pode voltar a usar o app depois — o cadastro fica salvo. Aqui, agora, seu cuidado é o que importa.
      </p>

      <div className="pt-2">
        <Link href="/home" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}>
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
