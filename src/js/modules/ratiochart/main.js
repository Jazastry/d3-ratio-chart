define(function(require) {
    var d3 = require('d3'),
        utils = require('utils'),
        minAngle = 0,
        maxAngle = 100,
        aColor = '#56D32E',
        bColor = '#086501';
        padding = 55;
        thickness = 12;

    function RatioChart(name, container, dataService) {
        this.name = name;
        this.container = container;
        this.dataService = dataService;
        this.subscriptionFunction = null;
        this.subscribe();
    }

    RatioChart.prototype.renderArcs = function(svg, obj) {
        var _this = this;
        var outR = (svg.attr('width') /2) - (2 * padding);
        var inR = (svg.attr('width') /2) - (2 * padding) - thickness;
        var cScale = d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]);
        var arc = d3.svg.arc()
            .innerRadius(inR)
            .outerRadius(outR)
            .startAngle(function(d) {
                return cScale(d.startAngle);
            }).endAngle(function(d) {
                return cScale(d.endAngle);
            });

        var translate = (svg.attr('width') /2) - padding;
        svg.selectAll("path")
            .data(obj.data).enter()
            .append("path").attr("d", arc)
            .style("fill", function(d) {
                return d.color;
            }).attr("transform", "translate("+translate+","+translate+")");
    };

    RatioChart.prototype.subscribe = function() {
        var _this = this,
            objA = null,
            objB = null;

        function revenueHandler(entryObj) {
            var propName = 'revenue';
            var nameA = 'tablet';
            var nameB = 'smartphone';

            switch (entryObj.name) {
                case nameA:
                    objA = utils.clone(entryObj);
                    break;
                case nameB:
                    objB = utils.clone(entryObj);
                    break;
                default:
                    break;
            }

            if (objA && objB) {
                _this.render(propName, objA, objB);
            }
        }

        function subscription(type, data) {
            if (type === 'create.tablet' || type === 'create.smartphone') {
                revenueHandler(data);
            }
        }

        _this.subscriptionFunction = subscription;
        _this.dataService.subscribe(_this.subscriptionFunction);
    };

    RatioChart.prototype.renderRatio = function(valCouple) {
        var scale = d3.scale.linear()
            .domain([0, d3.max(valCouple)])
            .range([0, 100]),
            ratio = scale(d3.min(valCouple));

        return d3.round(ratio, 0);
    };

    RatioChart.prototype.renderObject = function(propName, objA, objB) {
        var _this = this;

        var values = [objA[propName], objB[propName]];
        var total = objA[propName] + objB[propName];
        var renderObject = {
            values: values,
            ratio: _this.renderRatio(values),
            data: [objA, objB],
            chartName: propName
        };

        objA.perc = utils.percentageFromWhole(total, objA[propName]);
        objA.startAngle = renderObject.ratio;
        objA.endAngle = maxAngle;
        objA.color = aColor;
        objB.perc = utils.percentageFromWhole(total, objB[propName]);
        objB.startAngle = minAngle;
        objB.endAngle = renderObject.ratio;
        objB.color = bColor;

        return renderObject;
    };

    RatioChart.prototype.renderText = function(svg, obj) {
        var _this = this;

        var mainLabel = d3.svg.text();
        
    };

    RatioChart.prototype.render = function(propName, objA, objB) {
        var _this = this;
        var renderObject = _this.renderObject(propName, objA, objB);
        var width = _this.container.node().getBoundingClientRect().width;
        var height = _this.container.node().getBoundingClientRect().height;

        var svg = _this.container.append('svg')
            .attr("width", width)
            .attr("height", height);

        _this.renderArcs(svg, renderObject);
    };



    return RatioChart;
});
