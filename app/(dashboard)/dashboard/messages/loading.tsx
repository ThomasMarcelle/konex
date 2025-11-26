import { Skeleton, MessageSkeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations List */}
      <div className="w-80 shrink-0 bg-[#0A0C10] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#0A0C10] border border-white/10 rounded-2xl flex flex-col">
        <div className="flex-1 p-6">
          <MessageSkeleton />
          <div className="flex gap-3 mb-4 flex-row-reverse">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <Skeleton className="h-12 w-1/2 rounded-2xl" />
          </div>
          <MessageSkeleton />
        </div>
        <div className="p-4 border-t border-white/10">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

