import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface PageWrapperProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  children,
}) => {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-xs text-tertiary">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-secondary font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 dark:text-white leading-none tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-secondary font-light max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Header Action Button/Component */}
        {action && <div className="shrink-0 flex items-center">{action}</div>}
      </div>

      {/* Main Page Content */}
      <div className="flex-1 min-h-[400px]">
        {children}
      </div>
    </div>
  );
};
