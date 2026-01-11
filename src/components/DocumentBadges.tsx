import { Building2, Calendar, FileText, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface BadgeProps {
  className?: string;
}

export function AgencyBadge({ agency, className }: BadgeProps & { agency: string }) {
  const agencyColors: Record<string, string> = {
    OCC: 'bg-blue-100 text-blue-800',
    FDIC: 'bg-purple-100 text-purple-800',
    FED: 'bg-green-100 text-green-800',
    CFPB: 'bg-orange-100 text-orange-800',
    SEC: 'bg-indigo-100 text-indigo-800',
    FINCEN: 'bg-red-100 text-red-800',
    NCUA: 'bg-teal-100 text-teal-800',
    TREASURY: 'bg-amber-100 text-amber-800',
    STATE_NY: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
      agencyColors[agency] || 'bg-gray-100 text-gray-800',
      className
    )}>
      <Building2 className="w-3 h-3" />
      {agency}
    </span>
  );
}

export function PriorityBadge({ priority, className }: BadgeProps & { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase',
      colors[priority] || 'bg-gray-100 text-gray-800',
      className
    )}>
      {priority === 'high' && <AlertTriangle className="w-3 h-3" />}
      {priority}
    </span>
  );
}

export function TypeBadge({ type, className }: BadgeProps & { type: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700',
      className
    )}>
      <FileText className="w-3 h-3" />
      {type}
    </span>
  );
}

export function DateBadge({ date, className }: BadgeProps & { date: string }) {
  const formatted = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500',
      className
    )}>
      <Calendar className="w-3 h-3" />
      {formatted}
    </span>
  );
}

export function ImpactBadge({ score, className }: BadgeProps & { score: number }) {
  const color = score >= 80 ? 'text-red-600' : score >= 50 ? 'text-yellow-600' : 'text-green-600';
  const Icon = score >= 50 ? TrendingUp : TrendingDown;

  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold', color, className)}>
      <Icon className="w-3 h-3" />
      {score}
    </span>
  );
}
