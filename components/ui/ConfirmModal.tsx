import React, { ReactNode } from 'react';
import Modal from './Modal';
import { TrashIcon } from './Icons';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: ReactNode;
    confirmText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, children, confirmText = "Sí, Eliminar" }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="text-center space-y-4">
                <TrashIcon className="mx-auto h-12 w-12 text-red-500" />
                <div className="text-white">
                    {children}
                </div>
                <div className="mt-6 flex justify-center space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full justify-center rounded-lg border border-gray-600 bg-gray-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full justify-center rounded-lg border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
