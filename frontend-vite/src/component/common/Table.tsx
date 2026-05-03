import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  renderRow?: (item: T, index: number) => ReactNode;
}

export const Table = <T,>({ 
  columns, 
  data, 
  isLoading, 
  emptyMessage = "No data available",
  renderRow
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ width: col.width }}
                  className={`px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ${col.className}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item, rowIdx) => (
                renderRow ? (
                  renderRow(item, rowIdx)
                ) : (
                  <tr 
                    key={rowIdx} 
                    className="group hover:bg-gray-50/50 dark:hover:bg-primary-900/5 transition-colors duration-150"
                  >
                    {columns.map((col, colIdx) => (
                      <td 
                        key={colIdx} 
                        className={`px-6 py-4 text-[13.5px] font-medium text-gray-600 dark:text-gray-300 ${col.className}`}
                      >
                        {typeof col.accessor === "function" 
                          ? col.accessor(item) 
                          : (item[col.accessor] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                )
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};