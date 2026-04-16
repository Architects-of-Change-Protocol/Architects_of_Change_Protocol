import React from 'react';

interface ProblemCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export function ProblemCard({ title, children }: ProblemCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-red-900/40 bg-[#080808] min-h-[420px] p-8 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,42,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative flex h-full flex-col justify-between gap-8">
        <div className="flex items-center justify-center min-h-[240px]">
          {children}
        </div>

        <div className="text-[28px] md:text-[32px] leading-[1.2] tracking-tight text-[#f2dede]">
          {title}
        </div>
      </div>
    </div>
  );
}
