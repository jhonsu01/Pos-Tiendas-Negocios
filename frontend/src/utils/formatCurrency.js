/**
 * Formatea un número como moneda sin decimales y con separador de miles
 * @param {number} amount - El monto a formatear
 * @returns {string} - El monto formateado (ej: $34.600)
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0';
    }

    // Redondear al entero más cercano
    const rounded = Math.round(amount);

    // Formatear con separador de miles (punto)
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `$${formatted}`;
};
