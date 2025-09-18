// Modal.tsx
import { motion } from "framer-motion";
import React, { type SetStateAction } from "react";

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
  title,
  children,
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
          <div className="p-8">
            {/* TITLE */}
            <section className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-red-500"></div>
              <h3 className="text-2xl font-mono text-orange-400 uppercase tracking-wide">
                {title}
              </h3>
            </section>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
