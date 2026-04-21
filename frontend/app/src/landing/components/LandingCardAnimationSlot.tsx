import type { ReactNode } from 'react';

type LandingCardAnimationSlotProps = {
  children: ReactNode;
};

export function LandingCardAnimationSlot({ children }: LandingCardAnimationSlotProps) {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden min-h-[320px] sm:min-h-[280px] md:min-h-[240px]">
      {children}
    </div>
  );
}
