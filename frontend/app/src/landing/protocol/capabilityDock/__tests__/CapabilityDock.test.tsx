import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapabilityDock } from '../CapabilityDock';
import { CAPABILITY_FAMILIES } from '../../content';

// A real `.focus()` call (rather than firing a synthetic focus event) is
// what's needed for document.activeElement-based assertions further down —
// but React only flushes the resulting state update synchronously when it
// happens inside `act()`.
function focus(element: HTMLElement) {
  act(() => {
    element.focus();
  });
}

function setReducedMotion(matches: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion') ? matches : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

function getDesktopGroup() {
  return screen.getByRole('group', { name: /capability dock/i });
}

describe('CapabilityDock', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setReducedMotion(false);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    errorSpy.mockRestore();
  });

  it('renders all eight capabilities, once per layout, with no console errors', () => {
    render(<CapabilityDock />);

    const desktopGroup = getDesktopGroup();
    const desktopButtons = within(desktopGroup).getAllByRole('button');
    expect(desktopButtons).toHaveLength(CAPABILITY_FAMILIES.length);

    for (const capability of CAPABILITY_FAMILIES) {
      expect(within(desktopGroup).getByText(capability.name)).toBeInTheDocument();
    }

    // No duplicate-key or other React warnings during this render.
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('keeps each capability description in the DOM (accessible) even while visually collapsed', () => {
    render(<CapabilityDock />);
    const desktopGroup = getDesktopGroup();
    // Not expanded — nothing has been hovered/focused yet — but the text
    // must still exist for aria-describedby to resolve to real content.
    expect(within(desktopGroup).getByText(CAPABILITY_FAMILIES[0].summary)).toBeInTheDocument();
  });

  it('every card exposes aria-expanded and an aria-describedby that resolves to its description', () => {
    render(<CapabilityDock />);
    const desktopGroup = getDesktopGroup();
    const buttons = within(desktopGroup).getAllByRole('button');

    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
      const describedBy = button.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const description = document.getElementById(describedBy as string);
      expect(description).not.toBeNull();
      expect(description?.textContent).toContain(CAPABILITY_FAMILIES[index].summary);
    });
  });

  it('focusing a card expands it and marks it the roving tab stop; arrow keys move focus', async () => {
    const user = userEvent.setup();
    render(<CapabilityDock />);
    const desktopGroup = getDesktopGroup();
    const buttons = within(desktopGroup).getAllByRole('button');

    focus(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[0]).toHaveAttribute('tabindex', '0');
    expect(buttons[1]).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowLeft at the first card and ArrowRight at the last card do not move focus off the row', async () => {
    const user = userEvent.setup();
    render(<CapabilityDock />);
    const buttons = within(getDesktopGroup()).getAllByRole('button');

    focus(buttons[0]);
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(buttons[0]);

    focus(buttons[buttons.length - 1]);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });

  it('Home and End jump to the first and last capability', async () => {
    const user = userEvent.setup();
    render(<CapabilityDock />);
    const buttons = within(getDesktopGroup()).getAllByRole('button');

    focus(buttons[3]);
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('activates via Enter and Space like a native button, and toggles closed on repeat activation', async () => {
    const user = userEvent.setup();
    render(<CapabilityDock />);
    const buttons = within(getDesktopGroup()).getAllByRole('button');

    focus(buttons[2]);
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');

    // Space on an already-focused (already-expanded) button toggles it closed.
    await user.keyboard(' ');
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{Enter}');
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');
  });

  it('Escape collapses the currently expanded capability', async () => {
    const user = userEvent.setup();
    render(<CapabilityDock />);
    const buttons = within(getDesktopGroup()).getAllByRole('button');

    focus(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
  });

  it('resets to no dominant card once focus leaves the dock entirely', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">outside</button>
        <CapabilityDock />
      </div>,
    );
    const buttons = within(getDesktopGroup()).getAllByRole('button');
    const outside = screen.getByRole('button', { name: 'outside' });

    focus(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');

    await user.click(outside);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('still expands functionally under prefers-reduced-motion, without losing information', () => {
    setReducedMotion(true);
    render(<CapabilityDock />);
    const buttons = within(getDesktopGroup()).getAllByRole('button');

    focus(buttons[4]);
    expect(buttons[4]).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(buttons[4].getAttribute('aria-describedby') as string)?.textContent).toContain(
      CAPABILITY_FAMILIES[4].summary,
    );
  });

  it('renders the mobile carousel with all eight capabilities and a sensible default centered card', () => {
    render(<CapabilityDock />);
    const mobileGroup = screen.getByRole('group', { name: /capability carousel/i });
    const mobileButtons = within(mobileGroup).getAllByRole('button');
    expect(mobileButtons).toHaveLength(CAPABILITY_FAMILIES.length);

    // No real IntersectionObserver in jsdom (it's mocked as a no-op), so the
    // hook's initial state — the first capability — is what should show.
    expect(mobileButtons[0]).toHaveAttribute('aria-expanded', 'true');
  });
});
