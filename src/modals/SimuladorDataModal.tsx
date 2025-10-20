"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePickerSimulador } from "@/components/DatePickerSimulador";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function SimuladorDataModal() {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const router = useRouter();

  async function aplicarData() {
    if (!selectedDate) return;

    await fetch("/api/simulador", {
      method: "POST",
      body: JSON.stringify({
        dataSimulada: selectedDate.toISOString().split("T")[0],
      }),
    });

    setOpen(false);

    // 🔑 força reset da página inteira
    router.refresh();
    window.location.reload()
    // ou window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Calendar className="w-4 h-4" />
          <span>Date Selection</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulador de Data</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Selecione uma data para simulação ou use a data atual:
          </p>
          <DatePickerSimulador onDateSelected={setSelectedDate} />

          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              Data selecionada: {format(selectedDate, "dd/MM/yyyy")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={aplicarData} disabled={!selectedDate}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
