import { useTranslation } from 'react-i18next';
import { Headphones } from 'lucide-react';

export default function AgentsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
        <Headphones size={28} className="text-muted-foreground/40" />
      </div>
      <h1 className="text-lg font-semibold text-foreground mb-1.5">{t('pages.agents')}</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {t('pages.wip', { name: t('pages.agents') })}
      </p>
      <div className="flex items-center gap-1.5 mt-6">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/25 animate-bounce"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
