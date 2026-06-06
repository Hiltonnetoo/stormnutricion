import React from "react";
import { Modal, Button } from "../ui";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirmLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Excluir",
  cancelText = "Cancelar",
  isConfirmLoading = false,
}) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    size="sm"
    title={title}
    icon={
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </span>
    }
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isConfirmLoading}>{cancelText}</Button>
        <Button variant="danger" onClick={onConfirm} loading={isConfirmLoading} disabled={isConfirmLoading}>{confirmText}</Button>
      </>
    }
  >
    <p className="text-sm text-slate-500 dark:text-slate-400 py-1">{message}</p>
  </Modal>
);
