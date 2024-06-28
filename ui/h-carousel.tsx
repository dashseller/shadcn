'use client';

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HCarouselApi = UseEmblaCarouselType[1];
type UseHCarouselParameters = Parameters<typeof useEmblaCarousel>;
type HCarouselOptions = UseHCarouselParameters[0];
type HCarouselPlugin = UseHCarouselParameters[1];

type HCarouselProps = {
  opts?: HCarouselOptions;
  plugins?: HCarouselPlugin;
  direction?: 'left' | 'right';
  setApi?: (api: HCarouselApi) => void;
};

type HCarouselContextProps = {
  HcarouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & HCarouselProps;

const HCarouselContext = React.createContext<HCarouselContextProps | null>(null);

function useHCarousel() {
  const context = React.useContext(HCarouselContext);

  if (!context) {
    throw new Error('useHCarousel must be used within a <HCarousel />');
  }

  return context;
}

const HCarousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & HCarouselProps
>(({ direction = 'right', opts, setApi, plugins, className, children, ...props }, ref) => {
  const [HcarouselRef, api] = useEmblaCarousel(
    {
      ...opts,
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: HCarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className="overflow-hidden group/content">
      <div className="pr-12 w-full h-full">
        <HCarouselContext.Provider
          value={{
            HcarouselRef,
            api: api,
            opts,
            direction,
            scrollPrev,
            scrollNext,
            canScrollPrev,
            canScrollNext,
          }}
        >
          <div
            ref={ref}
            onKeyDownCapture={handleKeyDown}
            className={cn('relative w-full h-full', className)}
            role="region"
            aria-roledescription="Hcarousel"
            {...props}
          >
            {children}
          </div>
        </HCarouselContext.Provider>
      </div>
    </div>
  );
});
HCarousel.displayName = 'HCarousel';

const HCarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { HcarouselRef, direction } = useHCarousel();

    return (
      <div ref={HcarouselRef} className="h-full w-full">
        <div ref={ref} className={cn('flex h-full w-full', className)} {...props} />
      </div>
    );
  },
);
HCarouselContent.displayName = 'HCarouselContent';

const HCarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { direction } = useHCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn('min-w-0 shrink-0 grow-0 basis-full pr-4', className)}
        {...props}
      />
    );
  },
);
HCarouselItem.displayName = 'HCarouselItem';

const HCarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { direction, scrollPrev, canScrollPrev } = useHCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          'absolute  h-8 w-8 rounded-full drop-shadow-md hidden sm:flex invisible group-hover/content:visible',
          direction === 'right'
            ? 'right-2 top-1/2 -translate-y-1/2'
            : 'left-4 top-1/2 -translate-y-1/2',
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
HCarouselPrevious.displayName = 'HCarouselPrevious';

const HCarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { direction, scrollNext, canScrollNext } = useHCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          'absolute h-8 w-8 rounded-full drop-shadow-md hidden sm:flex invisible group-hover/content:visible',
          direction === 'right'
            ? '-right-8 top-1/2 -translate-y-1/2'
            : 'left-14 top-1/2 -translate-y-1/2',
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
HCarouselNext.displayName = 'HCarouselNext';

export {
  HCarousel,
  HCarouselContent,
  HCarouselItem,
  HCarouselNext,
  HCarouselPrevious,
  type HCarouselApi,
};
