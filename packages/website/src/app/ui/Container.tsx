import { cn } from '../lib/utils';
import { ElementType, HTMLAttributes, ReactNode } from 'react';

type MaxWidthOptions = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full';
type ItemsOptions = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyOptions = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  maxWidth?: MaxWidthOptions;
  px?: string | boolean;
  py?: string | boolean;
  flex?: boolean;
  items?: ItemsOptions;
  justify?: JustifyOptions;
  className?: string;
  children: ReactNode;
}

const maxWidthMap: Record<MaxWidthOptions, string> = {
  none: 'max-w-none',
  sm: 'max-w-screen-sm',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  prose: 'max-w-prose',
  full: 'max-w-full',
};

const itemsMap: Record<ItemsOptions, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyMap: Record<JustifyOptions, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export function Container({
  as: Component = 'div',
  maxWidth = 'full',
  px = false,
  py = false,
  flex = false,
  items,
  justify,
  className,
  children,
  ...rest
}: ContainerProps) {
  const base = 'mx-auto';
  const maxWidthClass = maxWidthMap[maxWidth];

  const pxClass = typeof px === 'string' ? px : px ? 'px-4 md:px-5 lg:px-6' : '';
  const pyClass = typeof py === 'string' ? py : py ? 'py-4 md:py-5' : '';
  const flexClass = flex ? 'flex' : '';
  const itemsClass = items ? itemsMap[items] : '';
  const justifyClass = justify ? justifyMap[justify] : '';

  const classes = cn(
    base,
    maxWidthClass,
    pxClass,
    pyClass,
    flexClass,
    itemsClass,
    justifyClass,
    className,
  );

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}