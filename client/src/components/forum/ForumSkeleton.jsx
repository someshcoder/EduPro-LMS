// Forum loading skeletons
export const QuestionCardSkeleton = () => (
  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 bg-slate-200 rounded w-32 mb-1.5" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
    </div>
    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-3.5 bg-slate-100 rounded w-full mb-1.5" />
    <div className="h-3.5 bg-slate-100 rounded w-5/6 mb-4" />
    <div className="flex gap-2 mb-4">
      <div className="h-5 bg-slate-100 rounded-full w-16" />
      <div className="h-5 bg-slate-100 rounded-full w-20" />
      <div className="h-5 bg-slate-100 rounded-full w-14" />
    </div>
    <div className="flex gap-4">
      <div className="h-4 bg-slate-100 rounded w-16" />
      <div className="h-4 bg-slate-100 rounded w-16" />
    </div>
  </div>
);

export const ThreadSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
      <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-5/6" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
        <div className="h-4 bg-slate-100 rounded w-full" />
      </div>
    </div>
    {[1, 2].map((i) => (
      <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-200" />
          <div>
            <div className="h-3.5 bg-slate-200 rounded w-28 mb-1.5" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

export const WalletSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
          <div className="h-8 bg-slate-200 rounded w-20 mb-1" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      ))}
    </div>
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
      <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between py-3 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  </div>
);

