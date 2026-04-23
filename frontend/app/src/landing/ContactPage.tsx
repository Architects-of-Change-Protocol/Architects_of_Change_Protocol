import { FormEvent, useState } from 'react';

const CONTACT_EMAIL = 'vicvalch@onchainfest.xyz';

export function renderContactPage() {
  return <ContactPage />;
}

function ContactPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = [
      `Name: ${name}`,
      `Company / Organization: ${company}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
    ].join('\n');

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject || 'AOC Protocol Inquiry'
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Contact AOC Protocol
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
            Let&apos;s design explicit access together.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
            Questions about developer collaboration, enterprise integration, partnerships,
            or the protocol itself? Send us your inquiry.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.25fr_1fr]">
          <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Start a conversation</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              This form opens a prefilled email to {CONTACT_EMAIL}. No backend storage is used yet.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Input label="Name" value={name} onChange={setName} required />
              <Input label="Company / Organization" value={company} onChange={setCompany} />
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Subject" value={subject} onChange={setSubject} required />
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-white/80">Message</span>
              <textarea
                value={message}
                required
                rows={6}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/[0.05]"
              />
            </label>

            <button
              type="submit"
              className="mt-7 inline-flex items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/90 px-6 py-3 text-sm font-semibold text-[#031018] transition-colors hover:bg-cyan-200"
            >
              Open email draft
            </button>
          </form>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
              Next steps
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Explore before reaching out</h2>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Review implementation concepts and enterprise patterns before starting the conversation.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <a href="/?view=docs" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:text-white">
                Review Docs
              </a>
              <a href="/?view=enterprise" className="inline-flex items-center justify-center rounded-xl border border-cyan-300/35 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/65 hover:bg-cyan-300/10">
                Visit Enterprise
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/[0.05]"
      />
    </label>
  );
}
