// Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  type: 'error' | 'success' | 'input' | 'message' 
}

export default function Modal({ isOpen, onClose, title, children, footer, type }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="space-y-4">{children}</div>

        {/* Footer (optional buttons/actions) */}
        {footer && (
          <div className="mt-6 border-t pt-3 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
