module.exports = {
    // Helper 'or' para condiciones OR
    or: function() {
        // Los arguments contienen todos los parámetros pasados al helper
        const args = Array.prototype.slice.call(arguments, 0, -1);
        return args.some(arg => !!arg);
    },

    // Helper 'and' para condiciones AND
    and: function() {
        const args = Array.prototype.slice.call(arguments, 0, -1);
        return args.every(arg => !!arg);
    },

    // Helper 'eq' para igualdad
    eq: function(a, b) {
        return a === b;
    },

    // Helper 'neq' para desigualdad
    neq: function(a, b) {
        return a !== b;
    },

    // Helper para formatear números
    formatNumber: function(number) {
        if (number === null || number === undefined) return '';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
};