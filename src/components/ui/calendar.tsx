'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn('p-3', className)}
			classNames={{
				months: 'flex flex-col sm:flex-row gap-4',
				month: 'flex flex-col gap-4',
				month_caption: 'flex justify-center pt-1 relative items-center w-full',
				caption_label: 'text-sm font-medium',
				nav: 'flex items-center gap-1',
				button_previous: cn(
					buttonVariants({ variant: 'outline' }),
					'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1',
				),
				button_next: cn(
					buttonVariants({ variant: 'outline' }),
					'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1',
				),
				month_grid: 'w-full border-collapse',
				weekdays: 'flex',
				weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center',
				week: 'flex w-full mt-2',
				day: 'relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md hover:bg-muted select-none rounded-lg flex items-center justify-center',
				day_button: cn(
					buttonVariants({ variant: 'ghost' }),
					'size-7 p-0 font-normal aria-selected:opacity-100',
				),
				range_end: 'day-range-end',
				selected:
					'bg-accent-foreground text-accent hover:bg-primary-foreground hover:text-primary focus:bg-primary-foreground focus:text-primary rounded-md',
				today: 'bg-accent-foreground text-accent rounded-md font-semibold hover:bg-muted-foreground hover:text-secondary',
				outside:
					'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
				disabled: 'text-muted-foreground opacity-50',
				range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
				hidden: 'invisible',
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) =>
					orientation === 'left' ? (
						<ChevronLeft className="size-4" />
					) : (
						<ChevronRight className="size-4" />
					),
			}}
			{...props}
		/>
	);
}

Calendar.displayName = 'Calendar';

export { Calendar };
