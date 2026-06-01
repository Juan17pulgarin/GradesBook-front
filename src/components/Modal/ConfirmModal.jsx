export default function ConfirmModal({ title, message, onConfirm, onCancel, loading, error }) {
    return (
        <div className="modal" onClick={onCancel}>
            <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                {error && <p className="modal-error">{error}</p>}
                <div className="confirm-actions">
                    <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
                    <button className="btn-confirm-delete" onClick={onConfirm} disabled={loading}>
                        {loading ? "Eliminando..." : "Sí, eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
