import { useState, useEffect, useCallback } from "react";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/services/api";
import DataTable from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import ViewModal from "@/components/ViewModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const columns = [
  { key: "name", label: "Name", filterable: true },
  { key: "email", label: "Email", filterable: true },
  { key: "department", label: "Department", filterable: true },
  { key: "teacherId", label: "Teacher ID", filterable: true },
  { key: "designation", label: "Designation", filterable: true },
];

const departmentOptions = ["CSE", "BBA", "MBA", "LAW", "PHARMACY", "ENGLISH"];

const formFields = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "department", label: "Department", type: "select", options: departmentOptions, required: true },
  { key: "teacherId", label: "Teacher ID", type: "number", required: true },
  { key: "designation", label: "Designation", required: true },
];

const editFields = formFields.map((f) =>
  f.key === "teacherId" ? { ...f, disabled: true } : f
);

const fieldLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  department: "Department",
  teacherId: "Teacher ID",
  designation: "Designation",
};

const Teachers = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [viewItem, setViewItem] = useState<Record<string, any> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Record<string, any> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async (filters: Record<string, string>) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v.trim()) params[k] = v.trim();
      });
      const res = await getTeachers(params);
      setData(res.data);
    } catch {
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial fetch when component mounts
    fetchData({});
  }, [fetchData]);

  // filter application no longer happens automatically on every keystroke.
  // the table component sends an explicit apply event (handleApply below).

  const handleColumnFilterChange = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setCurrentPage(1);
    fetchData(columnFilters);
  };

  const handleClear = () => {
    setColumnFilters({});
    fetchData({});
    setCurrentPage(1);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    setSubmitting(true);
    try {
      await createTeacher(formData);
      toast.success("Teacher created");
      setFormOpen(false);
      setCurrentPage(1);
      fetchData({});
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create teacher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editItem) return;
    setSubmitting(true);
    try {
      const { teacherId, ...rest } = formData;
      await updateTeacher(editItem.teacherId, rest);
      toast.success("Teacher updated");
      setEditItem(null);
      fetchData(columnFilters);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update teacher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await deleteTeacher(deleteItem.teacherId);
      toast.success("Teacher deleted");
      setDeleteItem(null);
      fetchData(columnFilters);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete teacher");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage teacher records</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Teacher
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onApplyFilters={handleApply}
        onClearFilters={handleClear}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onView={setViewItem}
        onEdit={setEditItem}
        onDelete={setDeleteItem}
      />

      <FormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} fields={formFields} title="Add Teacher" loading={submitting} />
      <FormModal open={!!editItem} onClose={() => setEditItem(null)} onSubmit={handleUpdate} fields={editFields} initialData={editItem ?? undefined} title="Edit Teacher" loading={submitting} />
      <ViewModal open={!!viewItem} onClose={() => setViewItem(null)} title="Teacher Details" data={viewItem} fieldLabels={fieldLabels} />
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Teacher" description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`} loading={submitting} />
    </div>
  );
};

export default Teachers;
