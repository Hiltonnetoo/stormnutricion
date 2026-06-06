import React from "react";
import { Skeleton } from "../ui";

const LoadingState: React.FC = () => (
  <div className="p-4 sm:p-6 space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3">
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full hidden sm:block" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

export default LoadingState;
