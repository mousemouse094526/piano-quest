import type { Ref } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DIRECTIONS,
  LENGTHS,
  MODES,
  type QuizSearch,
  SCRIPTS,
  withLength,
  withMode,
} from '../search';
import { DIRECTION_LABELS, LENGTH_UNITS, MODE_LABELS, SCRIPT_LABELS } from './labels';
import { keepFocus } from './noFocus';

type Option<T extends string> = { value: T; label: string };

/** Mode bar (D1, D2, D3, D26): every change hands the next search to `onChange`. */
export function ModeBar({
  search,
  onChange,
  ref,
}: {
  search: QuizSearch;
  onChange: (next: QuizSearch) => void;
  ref: Ref<HTMLElement>;
}) {
  return (
    <nav
      ref={ref}
      aria-label="ตั้งค่ารอบ"
      // A mouse pick keeps focus on the game area, so answer keys work right away; keyboard
      // users still reach the bar with Shift+Tab (D20, D26). Set here because Radix drops
      // an item's own onMouseDown.
      onMouseDown={keepFocus}
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
    >
      <SettingToggle
        label="Mode"
        value={search.mode}
        options={MODES.map((m) => ({ value: m, label: MODE_LABELS[m] }))}
        onValue={(mode) => onChange(withMode(search, mode))}
      />
      {search.mode !== 'zen' && (
        <>
          <Divider />
          <SettingToggle
            label={`ความยาว (${LENGTH_UNITS[search.mode]})`}
            value={String(search.len)}
            options={LENGTHS[search.mode].options.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
            onValue={(len) => onChange(withLength(search, Number(len)))}
          />
        </>
      )}
      <Divider />
      <SettingToggle
        label="ทิศคำถาม"
        value={search.dir}
        options={DIRECTIONS.map((d) => ({ value: d, label: DIRECTION_LABELS[d] }))}
        onValue={(dir) => onChange({ ...search, dir })}
      />
      <Divider />
      <SettingToggle
        label="ตัวอักษร solfège"
        value={search.script}
        options={SCRIPTS.map((s) => ({ value: s, label: SCRIPT_LABELS[s] }))}
        onValue={(script) => onChange({ ...search, script })}
      />
    </nav>
  );
}

/** One setting as a row of toggles; exactly one value stays chosen. */
function SettingToggle<T extends string>({
  label,
  value,
  options,
  onValue,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onValue: (value: T) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value}
      // Radix clears a single group when the chosen item is pressed again; ignore that.
      onValueChange={(v) => {
        if (v && v !== value) onValue(v as T);
      }}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="min-h-11 text-muted-foreground">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function Divider() {
  return <span aria-hidden="true" className="h-5 w-px bg-border" />;
}
