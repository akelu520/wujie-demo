import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function AccountsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">{t('pages.accounts')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.accounts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('pages.wip', { name: t('pages.accounts') })}</p>
        </CardContent>
      </Card>
    </div>
  );
}
