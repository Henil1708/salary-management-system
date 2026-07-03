import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

// Shared loading placeholders so every data surface shows a skeleton while
// its thunk is in flight, instead of an empty flash.

export const TableSkeleton = ({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="w-full">
    <div className="flex gap-4 border-b px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 border-b px-4 py-4">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <Card>
    <CardContent className="flex items-center gap-4 p-5">
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const ChartCardSkeleton = ({ height = 256 }: { height?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full" style={{ height }} />
    </CardContent>
  </Card>
);
