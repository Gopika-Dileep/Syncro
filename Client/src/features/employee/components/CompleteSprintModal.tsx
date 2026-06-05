import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, Package, Target, CheckCircle2, ChevronDown } from 'lucide-react';

interface Sprint {
    _id: string;
    name: string;
    status: string;
}

interface CompleteSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (moveTarget: string) => void;
    incompleteCount: number;
    availableSprints: Sprint[];
    isSubmitting?: boolean;
}

const CompleteSprintModal: React.FC<CompleteSprintModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    incompleteCount,
    availableSprints,
    isSubmitting = false
}) => {
    const [moveTarget, setMoveTarget] = useState<string>('backlog');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-black text-[#1f2124] tracking-tight">Complete Sprint</h3>
                            <p className="text-[11px] text-[#888] font-medium uppercase tracking-widest mt-0.5">Finalize your work cycle</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {incompleteCount > 0 ? (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                <div>
                                    <p className="text-[14px] font-bold text-amber-900">Incomplete Work</p>
                                    <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
                                        There are <span className="font-black underline">{incompleteCount} items</span> that were not finished in this sprint. Where should they go?
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest ml-1">Select Destination</p>
                                
                                <div className="grid gap-3">
                                    <button
                                        onClick={() => setMoveTarget('backlog')}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                            moveTarget === 'backlog' 
                                            ? 'border-[#fa8029] bg-[#fff5ef]/30' 
                                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${moveTarget === 'backlog' ? 'bg-[#fa8029] text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                            <Package size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[14px] font-black ${moveTarget === 'backlog' ? 'text-[#1f2124]' : 'text-gray-500'}`}>Backlog</p>
                                            <p className="text-[11px] text-gray-400 font-medium">Move items back to the project pool</p>
                                        </div>
                                        {moveTarget === 'backlog' && <div className="w-5 h-5 rounded-full bg-[#fa8029] flex items-center justify-center text-white text-[10px]"><ArrowRight size={12} /></div>}
                                    </button>

                                    {availableSprints.length > 0 ? (
                                        <div 
                                            onClick={() => {
                                                if (moveTarget === 'backlog') {
                                                    setMoveTarget(availableSprints[0]?._id || '');
                                                    setIsDropdownOpen(true);
                                                }
                                            }}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                                                moveTarget !== 'backlog' 
                                                ? 'border-[#fa8029] bg-[#fff5ef]/30' 
                                                : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${moveTarget !== 'backlog' ? 'bg-[#fa8029] text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                                    <Target size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-[14px] font-black ${moveTarget !== 'backlog' ? 'text-[#1f2124]' : 'text-gray-500'}`}>Another Sprint</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">Move directly to a future cycle</p>
                                                </div>
                                            </div>
                                            
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (moveTarget === 'backlog') {
                                                            setMoveTarget(availableSprints[0]?._id || '');
                                                            setIsDropdownOpen(true);
                                                        } else {
                                                            setIsDropdownOpen(!isDropdownOpen);
                                                        }
                                                    }}
                                                    className={`w-full p-3.5 rounded-xl border outline-none text-[13px] font-black transition-all flex items-center justify-between ${
                                                        moveTarget !== 'backlog'
                                                        ? 'bg-white border-[#fa8029]/20 text-[#1f2124] hover:border-[#fa8029]/40 shadow-sm'
                                                        : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    <span className="truncate">
                                                        {moveTarget === 'backlog'
                                                            ? 'Select a sprint...'
                                                            : availableSprints.find(s => s._id === moveTarget)?.name || 'Select a sprint...'
                                                        }
                                                    </span>
                                                    <ChevronDown 
                                                        size={16} 
                                                        className={`transition-transform duration-200 shrink-0 ${
                                                            isDropdownOpen && moveTarget !== 'backlog' ? 'rotate-180 text-[#fa8029]' : 'text-gray-400'
                                                        }`} 
                                                    />
                                                </button>

                                                {isDropdownOpen && moveTarget !== 'backlog' && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-[100]" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsDropdownOpen(false);
                                                            }} 
                                                        />
                                                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[110] max-h-48 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                                            {availableSprints.map(s => (
                                                                <button
                                                                    key={s._id}
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setMoveTarget(s._id);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3 rounded-xl text-left text-[13px] font-black transition-all flex items-center justify-between ${
                                                                        moveTarget === s._id
                                                                        ? 'bg-[#fff5ef] text-[#fa8029]'
                                                                        : 'text-[#555] hover:bg-gray-50 hover:text-[#1f2124]'
                                                                    }`}
                                                                >
                                                                    <span className="truncate">{s.name}</span>
                                                                    {moveTarget === s._id && (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#fa8029] shrink-0" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                                            <p className="text-[11px] text-gray-400 font-bold text-center italic">No other planned sprints available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h4 className="text-[18px] font-black text-[#1f2124]">All items are Done!</h4>
                            <p className="text-[13px] text-[#888] mt-2 max-w-[260px] mx-auto leading-relaxed">
                                Great job! Every item in this sprint was completed successfully.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 px-4 bg-white border border-[#eee] text-[#555] rounded-2xl text-[13px] font-black hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSubmitting || (incompleteCount > 0 && moveTarget === '')}
                        onClick={() => onConfirm(moveTarget)}
                        className="flex-1 py-3.5 px-4 bg-[#1f2124] text-white rounded-2xl text-[13px] font-black hover:bg-[#fa8029] transition-all shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Complete Sprint <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompleteSprintModal;
