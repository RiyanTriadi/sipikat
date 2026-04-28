'use client';

import { CheckCircle2, X } from 'lucide-react';

export default function AdminToast({ toast, onClose }) {
    if (!toast?.show) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm px-4 sm:px-0">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald-900">{toast.title || 'Berhasil'}</p>
                    {toast.message ? <p className="mt-1 text-sm text-emerald-800">{toast.message}</p> : null}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-900"
                    aria-label="Tutup notifikasi"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
