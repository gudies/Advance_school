import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    type: 'up' | 'down';
  };
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  className = '',
}) => {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardBody className="flex flex-col space-y-3 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {icon && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
              {icon}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <span className="text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>

          {(trend || description) && (
            <div className="flex items-center gap-1.5 mt-1">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    trend.type === 'up'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}
                >
                  {trend.type === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {trend.value}
                </span>
              )}
              {description && (
                <span className="text-xs text-slate-400 font-light truncate">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
