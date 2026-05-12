import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: "bg-rose-50",
            icon: "text-rose-500",
            button: "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
        },
        warning: {
            bg: "bg-amber-50",
            icon: "text-amber-500",
            button: "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
        },
        info: {
            bg: "bg-blue-50",
            icon: "text-blue-500",
            button: "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
        }
    };

    const style = colors[type];

    const modalContent = (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative z-[3010] animate-in fade-in zoom-in duration-200 overflow-hidden border border-white/20">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center ${style.icon}`}>
                            <AlertTriangle size={20} />
                        </div>
                        <button onClick={onClose} className="p-1 text-[#aaa] hover:text-[#555] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-[18px] font-black text-[#1f2124] mb-2">{title}</h3>
                    <p className="text-[14px] text-[#666] font-medium leading-relaxed">{message}</p>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-[13px] font-bold text-[#555] bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f9fafb] active:scale-[0.98] transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-3 text-[13px] font-bold text-white rounded-xl shadow-lg active:scale-[0.98] transition-all ${style.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
