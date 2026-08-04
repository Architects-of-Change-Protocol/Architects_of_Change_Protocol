import { IconCircle, SectionHeader } from './primitives';

const SEGMENTS = [
  {
    icon: 'M239.43,133l-32-80h0a8,8,0,0,0-9.16-4.84L136,62V40a8,8,0,0,0-16,0V65.58L54.26,80.19A8,8,0,0,0,48.57,85h0v.06L16.57,165a7.92,7.92,0,0,0-.57,3c0,23.31,24.54,32,40,32s40-8.69,40-32a7.92,7.92,0,0,0-.57-3L66.92,93.77,120,82V208H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16H136V78.42L187,67.1,160.57,133a7.92,7.92,0,0,0-.57,3c0,23.31,24.54,32,40,32s40-8.69,40-32A7.92,7.92,0,0,0,239.43,133Z',
    title: 'Legal Platforms',
    body: 'Tight, changing access windows across diligence and discovery',
  },
  {
    icon: 'M72,144H32a8,8,0,0,1,0-16H67.72l13.62-20.44a8,8,0,0,1,13.32,0l25.34,38,9.34-14A8,8,0,0,1,136,128h24a8,8,0,0,1,0,16H140.28l-13.62,20.44a8,8,0,0,1-13.32,0L88,126.42l-9.34,14A8,8,0,0,1,72,144ZM178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,.75,0,1.5,0,2.25a8,8,0,1,0,16-.5c0-.58,0-1.17,0-1.75A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46c0,53.61-77.76,102.15-96,112.8-10.83-6.31-42.63-26-66.68-52.21a8,8,0,1,0-11.8,10.82c31.17,34,72.93,56.68,74.69,57.63a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z',
    title: 'Healthcare',
    body: 'Conditions must be enforced, not just promised',
  },
  {
    icon: 'M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48Z',
    title: 'Enterprise SaaS',
    body: 'Every customer storage integration becomes bespoke access logic',
  },
  {
    icon: 'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z',
    title: 'Document Platforms',
    body: 'Access governance is the core product, not a bolt-on',
  },
  {
    icon: 'M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Z',
    title: 'AI Platforms',
    body: 'Agents request access at machine speed and volume',
  },
  {
    icon: 'M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Z',
    title: 'Financial Services',
    body: 'Access must be provable years after the fact',
  },
];

// Deck slide 9, reinforced by the One Pager's "Who It's For" audience tags.
export function CustomerSegments() {
  return (
    <section id="who-its-for" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Who It's For"
        title="Where the governance gap is most expensive"
        description="Six segments where 'prove what happened to this document' is routine, not rare."
      />

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-9">
        {SEGMENTS.map((segment) => (
          <div key={segment.title} className="flex items-start gap-5">
            <IconCircle>
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d={segment.icon} />
              </svg>
            </IconCircle>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">{segment.title}</h4>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{segment.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
