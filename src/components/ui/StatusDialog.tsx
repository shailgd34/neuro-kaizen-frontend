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
      <div className="flex flex-col items-center text-center max-w-sm mx-auto py-4">
        <div className="mb-6 bg-secondary/10 p-4 rounded-full border border-secondary/20 scale-110">
          {icon}
        </div>

        <h5 className="text-2xl font-bold text-white mb-2 tracking-tight">
          {title}
        </h5>

        {description && (
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {description}
          </p>
        )}

        {children && <div className="w-full mb-6">{children}</div>}

        {buttonText && (
          <Button
            onClick={onAction || onClose}
            className="w-full h-11 text-sm font-semibold shadow-lg shadow-secondary/10"
            disabled={disabled}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </Modal>
  );
}