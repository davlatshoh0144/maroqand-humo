'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

export interface BreadcrumbItemData {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  // On mobile, collapse middle items if there are more than 3
  // Show: first ... second-to-last last
  const shouldCollapse = items.length > 3;
  const visibleItems = shouldCollapse
    ? [items[0], null, items[items.length - 2], items[items.length - 1]]
    : items;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          // Null item = collapsed ellipsis
          if (item === null) {
            return (
              <span key="ellipsis" className="flex items-center gap-1.5 sm:gap-2.5">
                <BreadcrumbItem className="hidden md:inline-flex">
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:inline-flex" />
              </span>
            );
          }

          const isLast = index === visibleItems.length - 1;
          const isFirst = index === 0;
          const isClickable = !!item.onClick && !isLast;

          return (
            <span key={`${item.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbItem>
                {isClickable ? (
                  <BreadcrumbLink
                    asChild
                    className="cursor-pointer text-muted-foreground hover:text-foreground max-w-[160px] truncate"
                  >
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="inline-flex items-center gap-1"
                    >
                      {isFirst && <Home className="h-3.5 w-3.5" />}
                      <span className="truncate">{item.label}</span>
                    </button>
                  </BreadcrumbLink>
                ) : isLast ? (
                  <BreadcrumbPage className="max-w-[200px] truncate text-foreground">
                    <span className="inline-flex items-center gap-1">
                      {isFirst && items.length === 1 && <Home className="h-3.5 w-3.5" />}
                      <span className="truncate">{item.label}</span>
                    </span>
                  </BreadcrumbPage>
                ) : (
                  <span className="max-w-[160px] truncate text-muted-foreground">
                    {isFirst && <Home className="mr-1 inline h-3.5 w-3.5" />}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
