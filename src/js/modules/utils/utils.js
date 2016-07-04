define(function(require) {
    var d3 = require('d3');
    return {
        percentageFromWhole: function(whole, part, round) {
            return Number(((part / whole) * 100).toFixed(round ? round : 0));
        },
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        cScale:  d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]),
        euFormat: d3.locale({
                "decimal": ",",
                "thousands": ".",
                "grouping": [3],
                "currency": ["", "€"],
                "dateTime": "%a %b %e %X %Y",
                "date": "%m/%d/%Y",
                "time": "%H:%M:%S",
                "periods": ["AM", "PM"],
                "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            }),
    };
});
