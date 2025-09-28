'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';


export default function CsvWithPersistence({ onClose }: { onClose: () => void }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showTable, setShowTable] = useState(false); // 🔹 controla exibição da tabela

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('csvData');
    const savedHeaders = localStorage.getItem('csvHeaders');
    const savedColumns = localStorage.getItem('csvSelectedColumns');

    if (savedData && savedHeaders) {
      const hdrs = JSON.parse(savedHeaders);
      setRows(JSON.parse(savedData));
      setHeaders(hdrs);
      setSelectedColumns(savedColumns ? JSON.parse(savedColumns) : hdrs);
      setShowTable(true); // mostra tabela se já havia dados salvos
    }
  }, []);

  const processFile = (file: File) => {
    console.log("Arquivo recebido:", file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      encoding: "latin1",
      complete: (result) => {
        console.log("Papa.parse terminou. Total de linhas:", result.data.length);
        const parsed = result.data as Record<string, string>[];

        const cleanedRows = parsed.map((row) => {
  const cleanedRow: Record<string, string> = {};
  Object.entries(row).forEach(([key, value]) => {
    // Normaliza o header
    const cleanKey = key
      .replace(/^["']|["']$/g, "") // remove aspas
      .trim()
      .normalize("NFD") // separa acentos
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/�/g, "") // remove caracteres corrompidos
      .replace(/\s+/g, " "); // normaliza espaços

    cleanedRow[cleanKey] = value ?? "";
  });
  return cleanedRow;
});


        const hdrs = Object.keys(cleanedRows[0] || {});
        console.log("Cabeçalhos normalizados:", hdrs);
        setRows(cleanedRows);
        setHeaders(hdrs);
        setSelectedColumns(hdrs); // pré-seleciona todas
        setShowTable(true); // mostra tabela após upload
      },
      error: (err) => {
      console.error("Erro no Papa.parse:", err);
    },
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files.length > 0) {
      processFile(event.dataTransfer.files[0]);
    }
  };

  const handleSelectionChange = (header: string) => {
    setSelectedColumns((prev) =>
      prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header]
    );
  };

  const handleConfirmSelection = () => {
    localStorage.setItem('csvData', JSON.stringify(rows));
    localStorage.setItem('csvHeaders', JSON.stringify(headers));
    localStorage.setItem('csvSelectedColumns', JSON.stringify(selectedColumns));
    onClose(); // 🔹 avisa o pai para fechar o modal
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CSV com Persistência</h1>

      {/* Área de drag and drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-600">Arraste e solte o arquivo CSV aqui</p>
        <p className="text-sm text-gray-500">ou clique para selecionar</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
        >
          Escolher Arquivo
        </label>
      </div>

      {/* Seleção de colunas + tabela */}
{headers.length > 0 && showTable && (
  <div className="mt-4">
    <h2 className="font-semibold">Desmarque as colunas que não deseja usar:</h2>
    <div className="flex flex-wrap gap-3 mt-2">
      {headers.map((header) => (
        <label key={header} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedColumns.includes(header)}
            onChange={() => handleSelectionChange(header)}
          />
          {header}
        </label>
      ))}
    </div>

    {/* Botão Confirmar que também fecha o modal */}
    <button
  onClick={handleConfirmSelection}
  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
>
  Confirmar Seleção
</button>
<button
  onClick={onClose}
  className="mt-3 ml-3 px-4 py-2 bg-gray-400 text-white rounded"
>
  Cancelar
</button>

    {/* Prévia */}
    <div className="mt-6 overflow-auto max-h-80 border">
      <table className="w-full text-sm border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            {selectedColumns.map((header, i) => (
              <th key={i} className="border p-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {selectedColumns.map((header, cellIndex) => (
                <td key={cellIndex} className="border p-2">
                  {row[header] || <span className="text-gray-400 italic">vazio</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-gray-600">
        Total de linhas: <strong>{rows.length}</strong>
      </p>
    </div>
  </div>
)}
</div>
  );
}