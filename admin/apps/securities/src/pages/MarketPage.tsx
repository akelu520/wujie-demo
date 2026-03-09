import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function MarketPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">行情数据</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">行情数据</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">行情数据模块开发中，敬请期待...</p>
        </CardContent>
      </Card>
    </div>
  );
}
