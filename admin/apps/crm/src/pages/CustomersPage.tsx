import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function CustomersPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">{t('pages.customers')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.customers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('pages.wip', { name: t('pages.customers') })}</p>
        </CardContent>
      </Card>
    </div>
  );
}
