export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 mb-4">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-16 w-2/3 rounded-2xl" />
      </div>
    </div>
  );
}

