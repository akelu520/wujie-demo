import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export default function CategoriesPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">分类管理</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">分类管理</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">分类管理模块开发中，敬请期待...</p>
        </CardContent>
      </Card>
    </div>
  );
}
