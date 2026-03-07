import React, { useState } from 'react';
import '../styles/AdminPanel.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    requiredText,
    confirmButtonText = 'Confirmar',
    isLoading = false
}) => {
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const isConfirmed = requiredText
        ? inputValue === requiredText
        : true;

    const handleConfirm = () => {
        if (isConfirmed && !isLoading) {
            onConfirm();
            setInputValue('');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>

                    {requiredText && (
                        <div className="modal-required-input">
                            <label>Escribe <strong>{requiredText}</strong> para confirmar:</label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={requiredText}
                                className="modal-input"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="modal-cancel-btn" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </button>
                    <button
                        className={`modal-confirm-btn ${!isConfirmed ? 'disabled' : ''}`}
                        onClick={handleConfirm}
                        disabled={!isConfirmed || isLoading}
                    >
                        {isLoading ? 'Procesando...' : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
