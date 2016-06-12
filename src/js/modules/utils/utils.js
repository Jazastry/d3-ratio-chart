define(function(require) {
    return {
        percentageFromWhole: function(whole, part, round) {
            return Number(((part / whole) * 100).toFixed(round ? round : 0));
        },
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
    };
});