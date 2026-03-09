import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">数据报表</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">数据报表</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">数据报表模块开发中，敬请期待...</p>
        </CardContent>
      </Card>
    </div>
  );
}
