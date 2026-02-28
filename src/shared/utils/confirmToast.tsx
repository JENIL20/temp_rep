import React from "react";
import { toast, type Id, type ToastOptions } from "react-toastify";

export type ConfirmToastOptions = {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  toastOptions?: ToastOptions;
};

export function confirmToast({
  title = "Confirm action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  toastOptions,
}: ConfirmToastOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const idRef: { current: Id | null } = { current: null };

    const close = (result: boolean) => {
      resolve(result);
      if (idRef.current != null) toast.dismiss(idRef.current);
    };

    idRef.current = toast(
      ({ closeToast }) => (
        <div className="min-w-[260px] max-w-[360px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {title}
              </p>
              <div className="mt-1 text-sm text-slate-600 leading-snug">
                {message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeToast?.();
                close(false);
              }}
              className="shrink-0 px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              Esc
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => close(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => close(true)}
              className="px-3 py-1.5 rounded-lg bg-primary-navy hover:bg-primary-navy-dark text-white text-xs font-extrabold shadow-sm shadow-primary-navy/15 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        position: "top-center",
        ...toastOptions,
      }
    );
  });
}

