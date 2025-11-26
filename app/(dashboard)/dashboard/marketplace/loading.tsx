import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';

export default function MarketplaceLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-8">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="w-24 h-12 rounded-xl" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

