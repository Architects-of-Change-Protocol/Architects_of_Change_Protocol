import React from 'react';

interface ProblemCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export function ProblemCard({ title, children }: ProblemCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-red-800/30 bg-red-950/10 p-8 md:p-10 min-h-[420px] hover:-translate-y-1 transition">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,42,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative flex h-full flex-col justify-between gap-8">
        <div className="flex items-center justify-center min-h-[240px]">
          {children}
        </div>

        <p className="text-2xl text-red-100">{title}</p>
      </div>
    </div>
  );
}
