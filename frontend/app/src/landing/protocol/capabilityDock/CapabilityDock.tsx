import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CAPABILITY_FAMILIES, type CapabilityFamily } from '../content';
import { CapabilityCard } from './CapabilityCard';
import { CapabilityMineral } from './CapabilityMineral';
import { useCenteredCapability } from './useCenteredCapability';
import { useDiscreteInfluence, useDockProximity } from './useDockProximity';
import {
  DOCK_STAGE_MIN_HEIGHT_PX,
  DOCK_STAGE_PAD_TOP_PX,
  type CapabilityId,
} from './dockTokens';

const CAPABILITIES = CAPABILITY_FAMILIES as (CapabilityFamily & { id: CapabilityId })[];
const LAST_INDEX = CAPABILITIES.length - 1;

/** The dock's own row/carousel geometry, interaction and keyboard handling —
 * split out from CapabilityDockSection so the section stays a thin
 * eyebrow/headline/paragraph wrapper. Renders two independent layouts
 * (desktop proximity row, mobile scroll-snap carousel) switched purely by
 * Tailwind breakpoint, matching the rest of this codebase's convention for
 * responsive layout swaps rather than a JS media-query branch. */
export function CapabilityDock() {
  const reducedMotion = useReducedMotion() ?? false;
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktop = useDockProximity(CAPABILITIES.length, true, desktopContainerRef);
  const mobile = useCenteredCapability(CAPABILITIES.length, true, mobileContainerRef);
  const [rovingIndex, setRovingIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The roving tabindex position tracks the pointer-driven dominant card
  // whenever there is one (so Tab always re-enters near wherever the mouse
  // last was) and falls back to the last explicitly-focused/activated card
  // otherwise. Derived during render rather than mirrored via an effect —
  // there's no external system to synchronize with here, just two existing
  // pieces of state.
  const effectiveRovingIndex = desktop.dominantIndex ?? rovingIndex;

  const handleFocusCard = useCallback(
    (index: number) => {
      desktop.pinToCard(index);
      setRovingIndex(index);
    },
    [desktop],
  );

  const handleActivate = useCallback(
    (index: number) => {
      if (desktop.dominantIndex === index) {
        desktop.clear();
      } else {
        desktop.pinToCard(index);
      }
      setRovingIndex(index);
    },
    [desktop],
  );

  const focusIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(LAST_INDEX, index));
    buttonRefs.current[clamped]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          focusIndex(index - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          focusIndex(index + 1);
          break;
        case 'Home':
          event.preventDefault();
          focusIndex(0);
          break;
        case 'End':
          event.preventDefault();
          focusIndex(LAST_INDEX);
          break;
        case 'Escape':
          desktop.clear();
          event.currentTarget.blur();
          break;
        default:
          // Enter/Space activation is native <button> behavior — left alone
          // deliberately. Calling preventDefault() here for Space would also
          // cancel the button's own click-on-Space activation, not just the
          // page-scroll it's sometimes (wrongly) assumed to still need
          // guarding against on a real <button>.
          break;
      }
    },
    [desktop, focusIndex],
  );

  const handleCardRef = useCallback(
    (index: number, el: HTMLButtonElement | null) => {
      buttonRefs.current[index] = el;
      desktop.registerCard(index, el);
    },
    [desktop],
  );

  return (
    <>
      <div
        ref={desktopContainerRef}
        role="group"
        aria-label="Capability dock — eight properties a digital asset can declare about itself"
        className="relative hidden sm:flex items-end gap-3 lg:gap-4"
        style={{
          // Stage reserves room for the tallest dominant overlay + lift +
          // compact scale overhang. Height is invariant across pointer motion
          // and across which capability is dominant.
          minHeight: DOCK_STAGE_MIN_HEIGHT_PX,
          paddingTop: DOCK_STAGE_PAD_TOP_PX,
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) desktop.clear();
        }}
      >
        {CAPABILITIES.map((capability, index) => (
          <CapabilityCard
            key={capability.id}
            capability={capability}
            index={index}
            isDominant={desktop.dominantIndex === index}
            reducedMotion={reducedMotion}
            pointerX={desktop.pointerX}
            getCenterX={desktop.getCenterX}
            tabIndex={effectiveRovingIndex === index ? 0 : -1}
            detailId={`capability-dock-detail-${capability.id}`}
            onFocusCard={handleFocusCard}
            onActivate={handleActivate}
            onKeyDown={handleKeyDown}
            registerCard={(el) => handleCardRef(index, el)}
          />
        ))}
      </div>

      <div className="sm:hidden">
        <div
          ref={mobileContainerRef}
          role="group"
          aria-label="Capability carousel — eight properties a digital asset can declare about itself"
          className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory no-scrollbar"
          style={{ scrollPaddingInline: '1.5rem' }}
        >
          {CAPABILITIES.map((capability, index) => (
            <MobileCapabilityTile
              key={capability.id}
              capability={capability}
              isCentered={mobile.centeredIndex === index}
              reducedMotion={reducedMotion}
              onTap={() => mobile.scrollToIndex(index)}
              registerItem={(el) => mobile.registerItem(index, el)}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {CAPABILITIES.map((capability, index) => (
            <span
              key={capability.id}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                mobile.centeredIndex === index ? 'w-5 bg-violet-500' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function MobileCapabilityTile({
  capability,
  isCentered,
  reducedMotion,
  onTap,
  registerItem,
}: {
  capability: CapabilityFamily & { id: CapabilityId };
  isCentered: boolean;
  reducedMotion: boolean;
  onTap: () => void;
  registerItem: (el: HTMLButtonElement | null) => void;
}) {
  const influence = useDiscreteInfluence(isCentered, reducedMotion);
  const detailId = `capability-carousel-detail-${capability.id}`;
  const contentTransition = reducedMotion ? 'grid-template-rows 80ms linear' : 'grid-template-rows 220ms cubic-bezier(0.22,1,0.36,1)';

  return (
    <button
      type="button"
      ref={registerItem}
      onClick={onTap}
      aria-expanded={isCentered}
      aria-describedby={detailId}
      className={`flex w-[76%] shrink-0 snap-center flex-col items-center rounded-2xl border px-5 py-6 text-center transition-colors duration-200 ${
        isCentered ? 'border-violet-300 bg-violet-50/50 shadow-[0_20px_44px_rgba(139,92,246,0.18)]' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <CapabilityMineral id={capability.id} influence={influence} className="h-12 w-12 shrink-0" />
      <span className="mt-3 text-sm font-extrabold text-slate-900">{capability.name}</span>
      <div
        id={detailId}
        className="grid w-full text-left"
        style={{ gridTemplateRows: isCentered ? '1fr' : '0fr', marginTop: isCentered ? 12 : 0, transition: contentTransition }}
      >
        <div className="overflow-hidden">
          <p className="text-[13.5px] leading-relaxed text-slate-500">{capability.summary}</p>
        </div>
      </div>
    </button>
  );
}
