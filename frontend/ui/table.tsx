import { ReactNode } from "react";

type TableProps = {
  headers: string[];
  rows: ReactNode[][];
};

export function Table({ headers, rows }: TableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <table className="w-full border-collapse">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-4 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/10 text-sm text-slate-200">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
