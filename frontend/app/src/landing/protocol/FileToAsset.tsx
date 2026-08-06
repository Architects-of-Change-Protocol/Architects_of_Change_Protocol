import { useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Card, SectionHeader } from '../enterprise/primitives';
import { MINERALS } from '../enterprise/minerals';
import { TransformationCore } from './TransformationCore';
import { useTransformationPhase } from './useTransformationPhase';

const FILE_TRAITS = ['Content', 'Format', 'Location'];
const ASSET_TRAITS = ['Identity', 'Integrity', 'Provenance', 'Capabilities', 'References', 'Portability'];
const m = MINERALS.amethyst;

const traitListVariants: Variants = {
  hidden: { transition: { staggerChildren: 0.07 } },
  visible: { transition: { staggerChildren: 0.07 } },
};

const traitItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

export function FileToAsset() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { phase, reduceMotion } = useTransformationPhase(stageRef);
  const traitsRevealed = reduceMotion || phase === 'emit' || phase === 'rest';

  return (
    <section id="digital-asset" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="From File to Digital Asset"
        title="A file contains content. A digital asset carries more."
        description="Any file — a photo, a document, a dataset — is just bytes with a format and a place it happens to sit. An AOC-compatible digital asset adds a layer that compatible systems can interpret: who it belongs to, whether it's intact, where it came from, and what it's allowed to do."
        mineral="amethyst"
      />

      <div ref={stageRef} className="grid md:grid-cols-[minmax(0,26rem)_auto_minmax(0,26rem)] xl:grid-cols-[26rem_auto_26rem] md:justify-center gap-2 md:gap-0 items-center">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Card className="flex flex-col justify-center p-6 md:h-60 md:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-mono">A File</p>
            <p className="mt-2 font-mono text-slate-700 text-base leading-5">photo.jpg</p>
            <ul className="mt-4 space-y-1.5">
              {FILE_TRAITS.map((trait) => (
                <li key={trait} className="flex items-center gap-2.5 text-[15px] leading-5 text-slate-500">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  {trait}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        <TransformationCore phase={phase} reduceMotion={reduceMotion} />

        <div className={`flex flex-col justify-center rounded-2xl border ${m.border} ${m.soft} p-6 md:h-60 md:p-5`}>
          <p className={`text-xs uppercase tracking-[0.2em] font-mono ${m.text}`}>
            AOC-Compatible Digital Asset
          </p>
          <p className="mt-2 font-mono text-slate-700 text-base leading-5">photo.jpg + protocol context</p>
          <motion.ul
            className="mt-4 space-y-1.5"
            variants={traitListVariants}
            animate={traitsRevealed ? 'visible' : 'hidden'}
            initial={reduceMotion ? false : 'hidden'}
          >
            {ASSET_TRAITS.map((trait) => (
              <motion.li
                key={trait}
                className="flex items-center gap-2.5 text-[15px] leading-5 text-slate-900"
                variants={traitItemVariants}
              >
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                {trait}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-sm text-slate-500 leading-relaxed">
        Not every raw file is automatically an AOC-compatible asset. An application or tool that
        speaks the protocol creates or registers that context — see{' '}
        <a href="#creation" className={`${m.text} ${m.textHover} underline underline-offset-2`}>
          how an asset is created
        </a>
        .
      </p>
    </section>
  );
}
