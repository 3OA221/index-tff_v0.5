import { normalize } from '../../lib/search';

/**
 * Select-only combobox. Focus stays on the button; the current option is
 * conveyed with aria-activedescendant.
 *
 * Keys: arrows move (and open), Home / End jump, Enter or Space chooses (or
 * opens), Escape closes, a letter jumps to the next option starting with it,
 * Tab closes. Pointer: click toggles, hover moves the current option,
 * click outside closes.
 */
export class Combobox {
  readonly key: string;
  value: string | null = null;

  private readonly root: HTMLElement;
  private readonly button: HTMLButtonElement;
  private readonly list: HTMLElement;
  private readonly valueEl: HTMLElement;
  private readonly clear: HTMLButtonElement;
  private readonly options: HTMLElement[];
  private readonly label: string;
  private readonly onChange: (combo: Combobox) => void;
  private active = -1;

  constructor(root: HTMLElement, onChange: (combo: Combobox) => void) {
    this.root = root;
    this.key = root.dataset.combo ?? '';
    this.onChange = onChange;
    this.button = root.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    this.list = root.querySelector<HTMLElement>('[role="listbox"]')!;
    this.valueEl = root.querySelector<HTMLElement>('.combo__value')!;
    this.clear = root.querySelector<HTMLButtonElement>('[data-clear]')!;
    this.options = [...this.list.querySelectorAll<HTMLElement>('[role="option"]')];
    this.label = this.button.dataset.label ?? '';

    this.button.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
    this.button.addEventListener('keydown', (e) => this.onKey(e));
    this.clear.addEventListener('click', () => {
      this.set(null, true);
      this.button.focus();
    });
    this.options.forEach((opt, i) => {
      opt.addEventListener('pointermove', () => {
        if (this.active !== i) this.setActive(i, false);
      });
      // Keep focus on the button while clicking an option.
      opt.addEventListener('pointerdown', (e) => e.preventDefault());
      opt.addEventListener('click', () => this.choose(i));
    });
    document.addEventListener('pointerdown', (e) => {
      if (this.isOpen && !this.root.contains(e.target as Node)) this.close();
    });
  }

  get isOpen(): boolean {
    return !this.list.hidden;
  }

  has(value: string): boolean {
    return this.options.some((o) => o.dataset.value === value);
  }

  /** Set the value (null clears). Unknown values are ignored. */
  set(value: string | null, notify: boolean): void {
    if (value !== null && !this.has(value)) value = null;
    this.value = value;
    const index = this.options.findIndex((o) => o.dataset.value === value);
    this.options.forEach((o, i) => o.setAttribute('aria-selected', String(i === index)));
    const chosen = index >= 0 ? this.options[index] : undefined;
    this.valueEl.textContent = chosen ? (chosen.textContent ?? '').trim() : this.label;
    this.button.setAttribute(
      'aria-labelledby',
      chosen ? `${this.button.id}-label ${this.valueEl.id}` : `${this.button.id}-label`,
    );
    this.root.classList.toggle('is-active', Boolean(chosen));
    this.clear.hidden = !chosen;
    if (notify) this.onChange(this);
  }

  private open(index?: number): void {
    if (!this.isOpen) {
      this.list.hidden = false;
      this.button.setAttribute('aria-expanded', 'true');
    }
    const selected = this.options.findIndex((o) => o.dataset.value === this.value);
    this.setActive(index ?? (selected >= 0 ? selected : 0), true);
  }

  private close(): void {
    if (!this.isOpen) return;
    this.list.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    this.button.removeAttribute('aria-activedescendant');
    this.options.forEach((o) => o.classList.remove('is-current'));
    this.active = -1;
  }

  private setActive(index: number, scroll: boolean): void {
    if (!this.options.length) return;
    this.active = Math.max(0, Math.min(index, this.options.length - 1));
    this.options.forEach((o, i) => o.classList.toggle('is-current', i === this.active));
    const opt = this.options[this.active]!;
    this.button.setAttribute('aria-activedescendant', opt.id);
    if (scroll) opt.scrollIntoView({ block: 'nearest' });
  }

  private choose(index: number): void {
    const opt = this.options[index];
    this.close();
    if (opt) this.set(opt.dataset.value ?? null, true);
  }

  /** Next option (after the current one, wrapping) whose label starts with `char`. */
  private findByLetter(char: string): number {
    const c = normalize(char);
    const n = this.options.length;
    for (let step = 1; step <= n; step++) {
      const i = (Math.max(this.active, -1) + step + n) % n;
      if (normalize((this.options[i]!.textContent ?? '').trim()).startsWith(c)) return i;
    }
    return -1;
  }

  private onKey(e: KeyboardEvent): void {
    const last = this.options.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this.isOpen) this.open();
        else if (!e.altKey) this.setActive(this.active + 1, true);
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (!this.isOpen) this.open();
        else if (e.altKey) this.choose(this.active);
        else this.setActive(this.active - 1, true);
        return;
      case 'Home':
        e.preventDefault();
        this.open(0);
        return;
      case 'End':
        e.preventDefault();
        this.open(last);
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.isOpen) this.choose(this.active);
        else this.open();
        return;
      case 'Escape':
        if (this.isOpen) {
          e.preventDefault();
          this.close();
        }
        return;
      case 'Tab':
        this.close();
        return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.trim()) {
          const i = this.findByLetter(e.key);
          if (i >= 0) {
            e.preventDefault();
            this.open(i);
          }
        }
    }
  }
}
