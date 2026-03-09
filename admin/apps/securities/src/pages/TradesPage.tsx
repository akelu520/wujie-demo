import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function TradesPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">交易记录</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">交易记录</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">交易记录模块开发中，敬请期待...</p>
        </CardContent>
      </Card>
    </div>
  );
}
