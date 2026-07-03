import { ReactNode } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';

interface StatCardProps {
  icon: ReactNode;
  /** Tint classes for the icon tile, e.g. bg-indigo-100 text-indigo-600 */
  iconClassName: string;
  title: string;
  value: string;
  caption?: string;
}

export const StatCard = ({ icon, iconClassName, title, value, caption }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-5">
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl [&>svg]:h-6 [&>svg]:w-6',
          iconClassName
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {caption && <div className="text-xs text-muted-foreground">{caption}</div>}
      </div>
    </CardContent>
  </Card>
);
