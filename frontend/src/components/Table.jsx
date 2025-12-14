import React from 'react';

/**
 * Componente reutilizable para renderizar tablas usando clases de CSS puro.
 * @param {Array<string>} columns - Nombres de las columnas (ej: ['Título', 'Fecha', 'Acciones'])
 * @param {Array<Object>} data - Datos a mostrar (Array de objetos)
 * @param {function} renderRow - Función para renderizar el contenido <td> de cada fila
 */
const Table = ({ columns, data, renderRow }) => {
    if (!data || data.length === 0) {
        return <p style={{ padding: '1rem', color: '#6b7280' }}>No hay datos para mostrar.</p>;
    }

    return (
        <div style={{ overflowX: 'auto', marginBottom: '1rem' }} className="table-wrapper">
            <table className="styled-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            // Los estilos de <th> están en styles.css
                            <th key={index}>{col}</th> 
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item._id || index}>
                            {/* Renderiza el contenido específico de la fila */}
                            {renderRow(item, index)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;