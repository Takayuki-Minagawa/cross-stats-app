type Props = {
  label: string;
  value: string | number;
  tone?: 'default' | 'good' | 'warn' | 'bad';
};

export function StatCard({ label, value, tone = 'default' }: Props) {
  return (
    <div className={`stat-card ${tone !== 'default' ? tone : ''}`.trim()}>
      <div className="label">{label}</div>
      <div className="value">{typeof value === 'number' ? value.toFixed(3) : value}</div>
    </div>
  );
}
