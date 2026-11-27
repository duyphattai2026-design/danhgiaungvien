import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
  rose: 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
};

export default function StatusBadge({ evaluation, compact = false }) {
  const { statusKey, statusLabel, statusShort, badgeTone } = evaluation;
  const classes = TONE_CLASSES[badgeTone] || TONE_CLASSES.slate;

  const Icon =
    statusKey === 'pass'
      ? CheckCircle2
      : statusKey === 'consider'
      ? Clock
      : statusKey === 'knockout'
      ? XCircle
      : AlertTriangle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
      title={statusLabel}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{compact ? statusShort : statusLabel}</span>
    </span>
  );
}
