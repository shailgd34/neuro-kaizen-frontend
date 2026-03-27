import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-105 rounded-xl bg-cardBg border border-borderColor p-8 text-center">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-yellow-500 hover:opacity-80 cursor-pointer"
        >
          <X size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}