import type { ComponentType, PropsWithChildren } from 'react';
import type { RequireAllOrNone } from 'type-fest';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function ToolCard({ children }: PropsWithChildren) {
  return <Card className="p-4 max-w-xl gap-4">{children}</Card>;
}

export function ToolHeader({
  title,
  children,
  ActionIcon,
  actionLabel,
  onAction,
}: PropsWithChildren<
  RequireAllOrNone<
    {
      title: string;
      ActionIcon?: ComponentType;
      actionLabel?: string;
      onAction?: () => unknown;
    },
    'ActionIcon' | 'actionLabel' | 'onAction'
  >
>) {
  return (
    <header className="flex flex-col gap-1 max-w-xl">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {ActionIcon ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onAction}>
                <ActionIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{actionLabel}</p>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {children ? (
        <div className="contents text-muted-foreground">{children}</div>
      ) : null}
    </header>
  );
}

export function ToolRow({ children }: PropsWithChildren) {
  return <div className="flex gap-2 items-end">{children}</div>;
}

export function ToolField({
  label,
  className,
  children,
}: PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <label className={cn('flex flex-col gap-1 grow text-start', className)}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
