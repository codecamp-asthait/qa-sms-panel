import { useState, useEffect, useCallback } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services/api";
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
  { key: "registrationId", label: "Registration ID", filterable: true },
  { key: "age", label: "Age", filterable: true },
];

const departmentOptions = ["CSE", "BBA", "MBA", "LAW", "PHARMACY", "ENGLISH"];

const formFields = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "department", label: "Department", type: "select", options: departmentOptions, required: true },
  { key: "registrationId", label: "Registration ID", type: "number", required: true },
  { key: "age", label: "Age", type: "number", required: true },
];

const editFields = formFields.map((f) =>
  f.key === "registrationId" ? { ...f, disabled: true } : f
);

const fieldLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  department: "Department",
  registrationId: "Registration ID",
  age: "Age",
};

const Students = () => {
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
      const res = await getStudents(params);
      setData(res.data);
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    fetchData({});
  }, [fetchData]);

  // previously we triggered fetch on every filter change with a debounce.
  // the table now exposes an "Apply filters" button; call fetchData when that
  // button is pressed instead (see handleApply below).

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
      await createStudent(formData);
      toast.success("Student created");
      setFormOpen(false);
      setCurrentPage(1);
      fetchData({});
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editItem) return;
    setSubmitting(true);
    try {
      const { registrationId, ...rest } = formData;
      await updateStudent(editItem.registrationId, rest);
      toast.success("Student updated");
      setEditItem(null);
      fetchData(columnFilters);
    } catch (err: any) {
      console.log("rahat ", err);
      toast.error(err.response?.data?.error || "Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await deleteStudent(deleteItem.registrationId);
      toast.success("Student deleted");
      setDeleteItem(null);
      fetchData(columnFilters);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student records</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Student
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

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        fields={formFields}
        title="Add Student"
        loading={submitting}
      />

      <FormModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdate}
        fields={editFields}
        initialData={editItem ?? undefined}
        title="Edit Student"
        loading={submitting}
      />

      <ViewModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="Student Details"
        data={viewItem}
        fieldLabels={fieldLabels}
      />

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        loading={submitting}
      />
    </div>
  );
};

export default Students;
