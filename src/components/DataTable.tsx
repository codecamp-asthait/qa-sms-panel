import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Pencil, Trash2, Loader2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

interface Column {
  key: string;
  label: string;
  filterable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  loading: boolean;

  // filters are controlled by the parent; the table just displays them
  columnFilters: Record<string, string>;
  onColumnFilterChange: (key: string, value: string) => void;
  onFilterApply?: () => void; // callback for enter key in filter input

  // called when the user clicks the "Apply filters" button in the actions header
  onApplyFilters?: (filters: Record<string, string>) => void;
  // optional callback fired when the clear button is clicked. parent should
  // reset its filters state and usually refetch unfiltered data.
  onClearFilters?: () => void;

  // pagination props
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  onView: (item: Record<string, any>) => void;
  onEdit: (item: Record<string, any>) => void;
  onDelete: (item: Record<string, any>) => void;
}

const DataTable = ({
  columns,
  data,
  loading,
  columnFilters,
  onColumnFilterChange,
  onApplyFilters,
  onClearFilters,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
}: DataTableProps) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // sort data based on selected column
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      // handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDir === 'asc' ? 1 : -1;
      if (bVal == null) return sortDir === 'asc' ? -1 : 1;
      
      // numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // strings (case-insensitive)
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    
    return sorted;
  }, [data, sortKey, sortDir]);

  // pagination logic - paginate the sorted data
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return sortedData.slice(startIdx, endIdx);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // cycle through: asc -> desc -> null (original)
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      // new column, start with ascending
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getSortTooltip = (key: string) => {
    if (sortKey !== key) return 'Click to sort ascending';
    if (sortDir === 'asc') return 'Click to sort descending';
    return 'Click to reset to original';
  };



  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-lg border bg-card overflow-hidden">
        <TooltipProvider>
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className="font-semibold text-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(col.key)}
                        className="gap-1 h-auto px-1 py-0 hover:bg-transparent"
                      >
                        <span>{col.label}</span>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{getSortTooltip(col.key)}</TooltipContent>
                  </Tooltip>
                </TableHead>
              ))}
              <TableHead className="font-semibold text-foreground w-[140px]">Actions</TableHead>
            </TableRow>
            <TableRow className="bg-muted/20">
              {columns.map((col) => (
                <TableHead key={`filter-${col.key}`} className="py-2">
                  {col.filterable !== false ? (
                    <Input
                      placeholder={`Filter by ${col.label.toLowerCase()}...`}
                      value={columnFilters[col.key] || ""}
                      onChange={(e) => onColumnFilterChange(col.key, e.target.value)}
                      className="h-8 text-xs"
                    />
                  ) : null}
                </TableHead>
              ))}
              <TableHead className="py-2">
                {/* action buttons for applying/clearing filters */}
                <div className="flex gap-1">
                  {onApplyFilters && (
                    <Button size="sm" onClick={() => onApplyFilters(columnFilters)} className="flex-1">
                      Filter
                    </Button>
                  )}
                  {onClearFilters && (
                    <Button size="sm" variant="outline" onClick={onClearFilters} className="flex-1">
                      Clear
                    </Button>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, idx) => (
                <TableRow key={item._id || idx} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key}>{item[col.key] ?? "—"}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onView(item)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TooltipProvider>
      </div>
      {/* pagination controls */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-4 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page size:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="h-8 rounded border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
