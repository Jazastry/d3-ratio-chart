define(function(require) {
    var d3 = require('d3');
    return {
        percentageFromWhole: function(whole, part, round) {
            var res = Number(((part / whole) * 100).toFixed(round ? round : 0));
            return res;
        },
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        cScale: d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]),
        euFormat: d3.locale({
            "decimal": "",
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
        randomInt: function(numbRange) {
            var _this = this;
            return Math.floor((Math.random() * numbRange));
        }
    };
});
