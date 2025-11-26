import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';

export default function CandidatesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-52 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Section Title */}
      <Skeleton className="h-6 w-32 mb-4" />

      {/* Candidates List */}
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

