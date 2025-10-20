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
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload CSV</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 overflow-auto p-4 flex items-start sm:items-center justify-center">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-lg shadow-lg relative">
            <Dialog.Title className="sr-only">CSV Upload</Dialog.Title>

            <CsvWithPersistence onClose={() => setOpen(false)} />

            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}