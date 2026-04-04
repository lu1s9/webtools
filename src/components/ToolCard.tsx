import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
}

export function ToolCard({ title, description, href, badge, icon }: ToolCardProps) {
  return (
    <a href={href} className="group block">
      <Card className="h-full transition-colors hover:border-foreground/20">
        <CardHeader>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
              {icon}
            </div>
            {badge && (
              <Badge variant="secondary">{badge}</Badge>
            )}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </a>
  );
}
