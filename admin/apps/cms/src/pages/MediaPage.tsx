import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function MediaPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">媒体库</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">媒体库</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">媒体库模块开发中，敬请期待...</p>
        </CardContent>
      </Card>
    </div>
  );
}
