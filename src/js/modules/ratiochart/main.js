define(function(require) {
    var d3 = require('d3'),
        utils = require('utils'),
        minAngle = 0,
        maxAngle = 100,
        aColor = '#56D32E',
        bColor = '#086501',
        strokeColor = '#B8BEA8',
        lableColorLight = '#B2B2B2',
        lableColorMedium = '#8A8A8A',
        lableColorDark = '#393939',
        backColor = '#FFF',
        cyrclePadding = 55,
        objInfoPadding = 10,
        ratioCyrcleThickness = 13,
        strokesCount = 4,
        strokesThickness = 0.5,
        strokesCyrcleThickness = 5,
        containerWidth,
        containerHeight,
        cScale = d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]),
        euFormat = d3.locale({
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
        colors;

    function RatioChart(name, container, dataService, isCurrency) {
        this.name = name;
        this.container = container;
        this.dataService = dataService;
        this.subscriptionFunction = null;
        this.isCurrency = isCurrency;
        this.subscribe();
    }

    RatioChart.prototype.renderArcs = function(svg, obj) {
        var _this = this;
        var outR = (containerWidth / 2) - (2 * cyrclePadding);
        var inR = outR - ratioCyrcleThickness;
        var arc = _this.arc(inR, outR);

        var translateX = containerWidth / 2;
        var translateY = translateX - cyrclePadding;


        console.log('obj.data ', obj.data[0]);

        svg.selectAll("path")
            .data(obj.data).enter()
            .append("path").attr("d", arc)
            .style("fill", function(d) {
                return d.color;
            }).attr("transform", "translate(" + translateX + ", " + translateY + ")");
    };

    RatioChart.prototype.arc = function(inR, outR) {
        return d3.svg.arc()
            .innerRadius(inR)
            .outerRadius(outR)
            .startAngle(function(d) {
                return cScale(d.startAngle);
            }).endAngle(function(d) {
                return cScale(d.endAngle);
            });
    };

    RatioChart.prototype.renderInnerStrokesCyrcle = function(svg) {
        var _this = this;
        var strokesData = (function() {
            var res = [];
            var start = 0;
            var end = strokesThickness;
            for (var i = 0; i < strokesCount + 1; i++) {
                res.push({
                    startAngle: start,
                    endAngle: end,
                    color: strokeColor
                });

                start += 25;
                res.push({
                    startAngle: end,
                    endAngle: start,
                    color: backColor
                });
                end += 25;
            }
            return res.reverse();
        }());

        var outR = (containerWidth / 2) - (2 * cyrclePadding) - (ratioCyrcleThickness + 2);
        var inR = outR - strokesCyrcleThickness;
        var arc = _this.arc(inR, outR);

        var translateX = containerWidth / 2;
        var translateY = translateX - cyrclePadding;

        svg.selectAll("path")
            .data(strokesData).enter()
            .append("path").attr("d", arc)
            .style("fill", function(d) {
                return d.color;
            })
            .attr("transform", "translate(" + translateX + ", " + translateY + ")");
    };

    RatioChart.prototype.subscribe = function() {
        var _this = this,
            objA = null,
            objB = null;

        function revenueHandler(entryObj) {
            var propName = 'revenue';
            var nameA = 'tablet';
            var nameB = 'smartphone';
            _this.keyA = nameA;
            _this.keyB = nameB;
            _this.name = propName;

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
            .domain([d3.max(valCouple), 0])
            .range([0, 100]),
            ratio = scale(d3.min(valCouple));

        return d3.round(ratio, 2);
    };

    RatioChart.prototype.prepareRenderObject = function(propName, objA, objB) {
        var _this = this;

        var values = [objA[propName], objB[propName]];
        var total = objA[propName] + objB[propName];
        var renderObject = {
            values: values,
            ratio: _this.renderRatio(values),
            data: [objA, objB],
            chartName: propName,
            total: total
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

    RatioChart.prototype.numbFormat = function(numb) {
        var _this = this;

        return euFormat.numberFormat(_this.isCurrency ? "$," : ",")(numb);
    };

    RatioChart.prototype.renderInfo = function(svg, obj) {
        console.log('obj ', obj);
        var _this = this;

        function objInfoX(d) {
            var thisSelected = d3.select(this);
            var thisWidth = thisSelected.node().getBBox().width;
            return d.name === _this.keyA ? objInfoPadding + "px" :
                ((containerWidth - objInfoPadding) - thisWidth) + "px";
        }

        var mainInfoContainer = svg.append("g")
            .style({
                "text-anchor": "middle",
                "font-weight": 100
            });

        var mainLabelElement = mainInfoContainer.append("text")
            .style({
                "font-size": 29,
                "stroke": lableColorLight,
                "stroke-width": "1px",
                "fill": lableColorLight,
                "letter-spacing": 1,
            })
            .attr("x", "50%")
            .attr("y", "32%")
            .attr("dy", ".16em")
            .text(obj.chartName.toUpperCase());

        var sumElement = mainInfoContainer.append("text")
            .style({
                "font-size": 39,
                "stroke": lableColorDark,
                "stroke-width": "2px",
                "fill": lableColorDark,
                "letter-spacing": 0,
            })
            .attr("x", "50%")
            .attr("y", "40.4%")
            .attr("dy", ".16em")
            .text(_this.numbFormat(obj.total));

        var infoSectionLables = svg.append("g");

        var objInfoLables = infoSectionLables.selectAll("text")
            .data(obj.data).enter()
            .append("text").attr("d", "text")          
            .style({
                "text-transform": "capitalize",
                "font-size": "22px",
                "font-weight": "500",
                "stroke-width": "1px",
                "letter-spacing": 1,
            })
            .attr("fill", function(d) {
                return d.color;
            })
            .attr("stroke", function(d) {
                return d.color;
            }).text(function(d) {
                return d.name;
            })
            .attr("y", "73%")
            .attr("x", objInfoX);

        var infoSectionData = svg.append("g");

        var objMainData = infoSectionData.selectAll("text")
            .data(obj.data).enter()
            .append("g").attr("d", "g")            
            .append("text");            

        var perc = objMainData.append("tspan").text(function(d) {
            return d.perc + "%";
        });

        var objValue = objMainData.append("tspan").text(function(d) {
            return ' ' + _this.numbFormat(d[obj.chartName]);
        });


        objMainData.attr("y", "77%")
            .attr("x", objInfoX);
    };

    RatioChart.prototype.render = function(propName, objA, objB) {
        var _this = this;
        var renderObject = _this.prepareRenderObject(propName, objA, objB);
        containerWidth = _this.container.node().getBoundingClientRect().width;
        containerHeight = _this.container.node().getBoundingClientRect().height;

        var svg = _this.container.append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        _this.renderArcs(svg, renderObject);
        _this.renderInnerStrokesCyrcle(svg);
        _this.renderInfo(svg, renderObject);
    };

    return RatioChart;
});
