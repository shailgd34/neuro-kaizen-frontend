import Button from "./Button";
import Modal from "./Modal";

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  
}

export default function StatusDialog({
  open,
  onClose,
  icon,
  title,
  description,
  buttonText,
  onAction,
  children,
  disabled
}: StatusDialogProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">

        <div className="mb-2">{icon}</div>

        <h5 className="text-xl font-semibold text-textPrimary">
          {title}
        </h5>

        {description && (
          <p className="text-textSecondary text-sm">
            {description}
          </p>
        )}

        {buttonText && (
          <Button
            onClick={onAction}
            className="w-full mt-4"
            disabled={disabled}
          >
            {buttonText}
          </Button>
          
        )}
        {children}
      </div>
    </Modal>
  );
}