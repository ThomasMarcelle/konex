import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';

export default function CollaborationsLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Collaborations List */}
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

