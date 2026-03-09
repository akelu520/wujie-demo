import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function ProfilesPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">客户画像</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">客户画像</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">客户画像模块开发中，敬请期待...</p>
        </CardContent>
      </Card>
    </div>
  );
}
