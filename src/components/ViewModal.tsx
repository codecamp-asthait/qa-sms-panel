import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
  fieldLabels: Record<string, string>;
}

const ViewModal = ({ open, onClose, title, data, fieldLabels }: ViewModalProps) => {
  if (!data) return null;

  const displayFields = Object.entries(fieldLabels).filter(([key]) => key !== "_id" && key !== "__v");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-3 py-2">
          {displayFields.map(([key, label]) => (
            <div key={key} className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <span className="text-sm text-foreground text-right max-w-[60%]">
                {data[key] ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewModal;
