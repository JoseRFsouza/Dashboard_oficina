"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerSimulador({
  onDateSelected,
}: {
  onDateSelected?: (date: Date | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  function handleSelect(date: Date | undefined) {
    const newDate = date ?? null;
    setSelectedDate(newDate);
    onDateSelected?.(newDate);
    setOpen(false); // fecha o popover ao selecionar
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Date selection</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <Calendar
          mode="single"
          required
          selected={selectedDate ?? undefined}
          onSelect={handleSelect}
          autoFocus
          captionLayout="dropdown"
          startMonth={new Date(2018, 0)}
          endMonth={new Date(2035, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}