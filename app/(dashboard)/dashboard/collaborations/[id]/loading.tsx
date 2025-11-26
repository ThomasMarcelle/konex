import { Skeleton } from '@/components/ui/skeleton';

export default function CollaborationDetailLoading() {
  return (
    <div className="max-w-4xl">
      {/* Back Link */}
      <Skeleton className="h-4 w-40 mb-6" />

      {/* Header Card */}
      <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Submit Form Skeleton */}
      <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6 mb-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-12 w-full rounded-xl mb-4" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Posts List Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

