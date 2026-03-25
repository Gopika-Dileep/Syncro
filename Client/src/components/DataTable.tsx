import { Search, Plus, ChevronLeft, ChevronRight, ShieldAlert, Users } from "lucide-react";
import type { ReactNode } from "react";

// ─── Column definition ────────────────────────────────────────────────────────
export interface Column<T> {
    key: string;
    header: string;
    align?: "left" | "right" | "center";
    render: (row: T) => ReactNode;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface DataTableProps<T> {
    rows: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string;

    title: string;
    subtitle?: string;
    addLabel?: string;
    onAdd?: () => void;

    searchValue: string;
    onSearchChange: (v: string) => void;
    searchPlaceholder?: string;

    loading?: boolean;
    error?: string;

    page: number;
    totalRows: number;
    limit: number;
    onPageChange: (p: number) => void;

    emptyIcon?: ReactNode;
    emptyTitle?: string;
    emptySubtitle?: string;
    onEmptyAction?: () => void;
    emptyActionLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DataTable<T>({
    rows,
    columns,
    keyExtractor,
    title,
    subtitle,
    addLabel = "Add",
    onAdd,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    loading,
    error,
    page,
    totalRows,
    limit,
    onPageChange,
    emptyIcon,
    emptyTitle = "No records found",
    emptySubtitle = "",
    onEmptyAction,
    emptyActionLabel = "Add",
}: DataTableProps<T>) {
    const totalPages = Math.ceil(totalRows / limit);
    const showPagination = totalRows > 5;
    const from = totalRows === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, totalRows);

    // Always render at least 5 rows so table height is stable
    const MIN_ROWS = 5;
    const ghostCount = Math.max(0, MIN_ROWS - rows.length);

    const alignClass = (align?: "left" | "right" | "center") =>
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

    return (
        <div className="p-4 md:p-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-[16px] font-bold text-[#1f2124]">{title}</h1>
                    {subtitle && <p className="text-[12px] text-[#aaa] mt-0.5">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-3">
                    {/* Pill search */}
                    <div className="flex items-center gap-2 bg-white border border-[#ebebeb] rounded-full px-3.5 py-2 w-[220px]">
                        <Search size={13} className="text-[#ccc] flex-shrink-0" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="flex-1 text-[12px] text-[#1f2124] placeholder:text-[#ccc] bg-transparent outline-none min-w-0"
                        />
                    </div>

                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="inline-flex items-center gap-1.5 bg-[#fa8029] hover:bg-[#e67320] text-white px-4 py-2 rounded-full font-semibold text-[12px] transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={13} strokeWidth={2.5} />
                            {addLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table card ── */}
            <div className="bg-white border border-[#ebebeb] rounded-sm overflow-hidden">

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#ebebeb] border-t-[#1f2124] rounded-full animate-spin" />
                        <p className="text-[12px] text-[#bbb]">Loading...</p>
                    </div>

                ) : error ? (
                    <div className="py-20 flex flex-col items-center gap-2 text-rose-400">
                        <ShieldAlert size={26} strokeWidth={1.5} />
                        <p className="text-[13px] font-medium">{error}</p>
                    </div>

                ) : rows.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="w-11 h-11 bg-[#f7f7f7] rounded-xl flex items-center justify-center">
                            {emptyIcon ?? <Users size={18} className="text-[#ddd]" />}
                        </div>
                        <div className="text-center">
                            <p className="text-[13px] font-semibold text-[#1f2124]">{emptyTitle}</p>
                            {emptySubtitle && <p className="text-[12px] text-[#aaa] mt-0.5">{emptySubtitle}</p>}
                        </div>
                        {onEmptyAction && (
                            <button
                                onClick={onEmptyAction}
                                className="inline-flex items-center gap-1.5 bg-[#1f2124] hover:bg-[#fa8029] text-white px-4 py-2 rounded-full font-semibold text-[12px] transition-all"
                            >
                                <Plus size={13} /> {emptyActionLabel}
                            </button>
                        )}
                    </div>

                ) : (
                    <>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`px-4 py-3 text-[11px] font-medium text-[#bbb] tracking-wide whitespace-nowrap ${alignClass(col.align)}`}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Data rows */}
                                {rows.map((row) => (
                                    <tr
                                        key={keyExtractor(row)}
                                        className="border-b border-[#f7f7f7] hover:bg-[#fafafa] transition-colors"
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={`px-4 py-3 ${alignClass(col.align)}`}
                                            >
                                                {col.render(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Ghost rows — keep table height fixed at 5 rows */}
                                {Array.from({ length: ghostCount }).map((_, i) => (
                                    <tr key={`ghost-${i}`} className="border-b border-[#f7f7f7] last:border-0">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-3">
                                                <span className="block h-[20px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination — only when totalRows > 5 */}
                        {showPagination && (
                            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f5f5f5] bg-[#fafafa]">
                                <p className="text-[11px] text-[#c0c0c0]">
                                    {from}–{to} <span className="text-[#ddd]">of</span> {totalRows}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => onPageChange(page - 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded-md border border-[#ebebeb] text-[#bbb] hover:bg-white disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => onPageChange(p)}
                                            className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all ${p === page
                                                ? "bg-[#1f2124] text-white"
                                                : "border border-[#ebebeb] text-[#bbb] hover:bg-white"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => onPageChange(page + 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded-md border border-[#ebebeb] text-[#bbb] hover:bg-white disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
