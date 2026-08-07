import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderDocsPage } from './DocsPage';
import { ProtocolToEnterprise } from './protocol/ProtocolToEnterprise';

describe('public Protocol developer journey', () => {
  it('renders Protocol documentation without the former Enterprise control-plane framing', () => {
    const { container } = render(renderDocsPage());

    expect(screen.getByRole('heading', { level: 1, name: 'Build with sovereign digital assets.' })).toBeInTheDocument();
    expect(screen.getByLabelText('Breadcrumb')).toHaveTextContent(/Protocol.*Documentation/);
    expect(container).not.toHaveTextContent('consent-native control plane');
    expect(container).not.toHaveTextContent('Protocol / Enterprise / Developers');
    expect(screen.getByRole('heading', { name: 'Inspect it. Challenge it. Improve it.' })).toBeInTheDocument();
  });

  it('makes Protocol documentation the primary CTA before Enterprise', () => {
    const { container } = render(<ProtocolToEnterprise />);
    const links = within(container).getAllByRole('link');

    expect(links.at(-2)).toHaveTextContent('Review Protocol Documentation');
    expect(links.at(-2)).toHaveAttribute('href', '/?view=docs#getting-started');
    expect(links.at(-1)).toHaveTextContent('Explore AOC Enterprise');
    expect(links.at(-1)).toHaveAttribute('href', '/?view=enterprise');
  });

  it('keeps both product crystal clusters decorative', () => {
    const { container } = render(<ProtocolToEnterprise />);
    const crystals = container.querySelectorAll('svg[aria-hidden="true"]');

    expect(crystals).toHaveLength(2);
    expect(within(container).getByText('Identity')).toBeInTheDocument();
    expect(within(container).getByText('Governance')).toBeInTheDocument();
  });
});
