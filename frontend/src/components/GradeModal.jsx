import React, { useState, useEffect } from 'react';

const GradeModal = ({ isOpen, onClose, onConfirm, initialValue = '' }) => {
    const [grade, setGrade] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setGrade(initialValue || '');
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(grade);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Calificar Entrega</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <p className="text-gray-600 mb-4 text-sm">
                        Ingresa la calificación (0-100) para este alumno.
                    </p>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ej. 85"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        autoFocus
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md transition-colors"
                        >
                            Guardar Nota
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GradeModal;
