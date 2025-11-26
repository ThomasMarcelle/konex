import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
          <Skeleton className="h-6 w-32 mx-auto mb-4" />
          <Skeleton className="h-8 w-56 mx-auto mb-2" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>

        {/* Form Card */}
        <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-8">
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}

