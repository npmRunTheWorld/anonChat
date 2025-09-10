// Modal.tsx
import { motion } from "framer-motion";
import React, { Children, type SetStateAction } from "react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen?: React.Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  type: "error" | "success" | "input" | "message";
  modalClass?: string;
}

export default function Modal({
  isOpen,
  setIsOpen,
  onClose,
  title,
  children,
  footer,
  type,
  modalClass,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => (setIsOpen ? setIsOpen(false) : (isOpen = false))}
      >
        <motion.div
          className="bg-gray-900 border-2 border-orange-500 max-w-md w-full mx-4 relative"
          initial={{ scale: 0.8, rotate: -2 }}
          animate={{ scale: 1, rotate: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  );
}
