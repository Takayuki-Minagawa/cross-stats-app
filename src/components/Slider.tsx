type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  tooltip?: string;
};

export function Slider({ label, value, min, max, step = 0.01, onChange, format, tooltip }: Props) {
  const display = format ? format(value) : value.toFixed(step < 1 ? 2 : 0);
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
        <span className="value">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
