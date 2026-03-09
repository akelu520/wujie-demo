import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function TradesPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">{t('pages.trades')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.trades')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('pages.wip', { name: t('pages.trades') })}</p>
        </CardContent>
      </Card>
    </div>
  );
}
