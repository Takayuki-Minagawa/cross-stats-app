import { CSSProperties, ReactNode, useState } from 'react';
import { useLang } from '../i18n';
import { t } from '../i18n/common';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  tooltip?: string;
  action?: ReactNode;
};

export function Slider({ label, value, min, max, step = 0.01, onChange, format, tooltip, action }: Props) {
  const display = format ? format(value) : value.toFixed(step < 1 ? 2 : 0);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider">
      <span className="slider-head">
        <span>
          {tooltip ? (
            <span className="tooltip" data-tip={tooltip}>
              {label}
            </span>
          ) : (
            label
          )}
        </span>
        <span className="slider-right">
          {action}
          <span className="value">{display}</span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

// 乱数シード用スライダー。🎲 ボタンでランダムなシードに切り替えられる
export function SeedSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { lang } = useLang();
  const m = t(lang);
  const [spin, setSpin] = useState(0);
  return (
    <Slider
      label={m.seed}
      value={value}
      min={1}
      max={999}
      step={1}
      onChange={onChange}
      action={
        <button
          type="button"
          className="dice-btn"
          title={m.dice}
          aria-label={m.dice}
          style={{ transform: `rotate(${spin * 360}deg)` }}
          onClick={(e) => {
            e.preventDefault();
            setSpin((s) => s + 1);
            let next = value;
            while (next === value) next = 1 + Math.floor(Math.random() * 999);
            onChange(next);
          }}
        >
          🎲
        </button>
      }
    />
  );
}
