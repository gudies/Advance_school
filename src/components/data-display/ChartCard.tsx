import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-805">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white font-heading">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-slate-400 font-light">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardBody className="pt-6 h-[300px]">
        {children}
      </CardBody>
    </Card>
  );
};
