'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload } from 'lucide-react';
import CsvWithPersistence from '@/components/csvUploader';
import { useCSV } from '@/lib/useCSV';

interface CsvUploadDialogProps {
  onReset: () => void; // função para limpar o dashboard
}

export default function CsvUploadDialog({ onReset }: CsvUploadDialogProps) {
   const { resetCSV } = useCSV();
  const [open, setOpen] = useState(false);

  const handleTriggerClick = () => {
    // 🔑 limpa o dashboard antes de abrir o modal
    resetCSV(); 
    onReset();
    setOpen(true);

  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          onClick={handleTriggerClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/80 bg-background text-foreground hover:bg-secondary hover:text-foreground transition-colors shadow-2xs"
        >
          <Upload className="w-3.5 h-3.5 text-sky-500" />
          <span>Upload CSV</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-50 overflow-auto p-4 flex items-start sm:items-center justify-center">
          <div className="w-full max-w-4xl bg-card border border-border text-card-foreground rounded-2xl shadow-xl relative overflow-hidden">
            <Dialog.Title className="sr-only">CSV Upload</Dialog.Title>

            <CsvWithPersistence onClose={() => setOpen(false)} />

            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors">
                ✕
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}