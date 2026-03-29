"use client";

interface CSVExportProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

export function CSVExportButton({ data, filename, label = "Export CSV" }: CSVExportProps) {
  const handleExport = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        const str = String(val ?? "");
        return str.includes(",") ? `"${str}"` : str;
      }).join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-gray-200 hover:bg-white/[0.08] transition-colors"
    >
      {label} ↓
    </button>
  );
}
