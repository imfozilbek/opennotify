interface ConfirmDialogProps {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: "danger" | "primary"
    isLoading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "danger",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps): JSX.Element {
    const confirmButtonClass = confirmVariant === "danger" ? "btn-danger" : "btn-primary"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card w-full max-w-md p-6">
                <div className="flex items-start gap-4">
                    {confirmVariant === "danger" && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <p className="mt-2 text-sm text-gray-500">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="btn-secondary"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={confirmButtonClass}
                    >
                        {isLoading ? "..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
