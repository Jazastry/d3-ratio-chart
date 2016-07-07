define(function(require) {
    var d3 = require('d3'),
        utils = require('utils'),
        minAngle = 0,
        maxAngle = 100,
        aColor,
        bColor,
        strokeColor,
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
        arcs,
        infoSectionData,
        sumElement,
        objMainData;

    function RatioChart(options) {
        this.name = options.dataKey;
        this.container = options.container;
        this.dataService = options.dataService;
        this.isCurrency = options.isCurrency ? options.isCurrency : false;
        this.subscriptionFunction = null;
        this.colorScheme(options.colorScheme);
        this.keyA = 'tablet';
        this.keyB = 'smartphone';

        this.subscribe();
    }

    RatioChart.prototype.colorScheme = function(name) {
        switch(name) {
            case 'green':
                aColor = '#56D32E';
                bColor = '#086501';
                strokeColor = '#B9C3A0';
                break;
            case 'yellow':
                aColor = '#F8C104';
                bColor = '#D65111';
                strokeColor = '#BBB990';
                break;
            case 'blue':
                aColor = '#17C4E4';
                bColor = '#114F66';
                strokeColor = '#B8B8B8';
                break;
            default:
                break;
        }
    };

    RatioChart.prototype.renderArcs = function(svg, obj) {
        var _this = this;
        var outR = (containerWidth / 2) - (2 * cyrclePadding);
        var inR = outR - ratioCyrcleThickness;
        var arc = _this.arc(inR, outR);

        var translateX = containerWidth / 2;
        var translateY = translateX - cyrclePadding;

        arcs = svg.selectAll("path")
            .data(function(d) {
                return d.data;
            }).enter()
            .append("path")
            .attr("d", arc)
            .style("fill", function(d) {
                return d.color;
            }).attr("transform", "translate(" + translateX + ", " + translateY + ")");

        arcs.update = function(updateObj) {
            arcs.data(updateObj.data).attr("d", arc);
        };
    };

    RatioChart.prototype.arc = function(inR, outR) {
        return d3.svg.arc()
            .innerRadius(inR)
            .outerRadius(outR)
            .startAngle(function(d) {
                return utils.cScale(d.startAngle);
            })
            .endAngle(function(d) {
                return utils.cScale(d.endAngle);
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
            objA,
            objB;

        function dataHandler(type, entryObj) {
            switch (entryObj.name) {
                case _this.keyA:
                    objA = utils.clone(entryObj);
                    break;
                case _this.keyB:
                    objB = utils.clone(entryObj);
                    break;
                default:
                    break;
            }

            if (objA && objB && type === 'create') {
                _this.render(objA, objB);
            } else if (type === 'update') {                
                _this.update(objA, objB);                
            }
        }

        function subscription(type, data) {
            if (type === 'create.' + _this.keyA || type === 'create.' + _this.keyB) {
                dataHandler('create', data);                
            } else if (type === 'update.' + _this.keyA || type === 'update.' + _this.keyB) {                
                dataHandler('update', data);
            }
        }

        _this.subscriptionFunction = subscription;
        _this.dataService.subscribe(_this.subscriptionFunction);
    };

    RatioChart.prototype.prepareRenderObject = function(objA, objB) {

        var _this = this;

        var values = [objA[_this.name], objB[_this.name]];
        var total = objA[_this.name] + objB[_this.name];

        var renderObject = {
            values: values,
            ratio: 0,
            data: [objA, objB],
            chartName: _this.name,
            total: total
        };

        
        objB.perc = utils.percentageFromWhole(total, objB[_this.name]);
        objB.startAngle = minAngle;
        objB.endAngle = objB.perc;
        objB.color = bColor;

        objA.perc = utils.percentageFromWhole(total, objA[_this.name]);
        objA.startAngle = objB.perc;
        objA.endAngle = maxAngle;
        objA.color = aColor;

        renderObject.ratio = objB.perc;

        return renderObject;
    };

    RatioChart.prototype.numbFormat = function(numb) {
        var _this = this;

        return utils.euFormat.numberFormat(_this.isCurrency ? "$," : ",")(numb);
    };

    RatioChart.prototype.renderInfo = function(svg) {
        var _this = this;

        function objInfoX(d) {
            var thisSelected = d3.select(this);
            var thisWidth = thisSelected.node().getBBox().width;
            return d.name === _this.keyA ? objInfoPadding + "px" :
                ((containerWidth - objInfoPadding) - thisWidth) + "px";
        }

        var mainInfoContainer = svg.append("g").style({
                "text-anchor": "middle",
                "font-weight": 100
            });

        var mainLabelElement = mainInfoContainer.append("text")
            .attr("d", "text")           
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
            .text(function(d) {                
                return d.chartName.toUpperCase();
            });

        sumElement = mainInfoContainer.append("text")
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
            .text(function(d) {
                return _this.numbFormat(d.total);
            });

        var infoSectionLables = svg.append("g");

        var objInfoLables = infoSectionLables.selectAll("text")
            .data(function(d) {
                return d.data;
            }).enter()
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
            .attr("y", "71%")
            .attr("x", objInfoX);

        infoSectionData = svg.append("g");
        objMainData = infoSectionData.selectAll("text")
            .data(function(d) {
                return d.data;
            }).enter()
            .append("g")
            .append("text")
            .style({
                    "stroke": lableColorMedium,
                    "stroke-width": "1px",
                    "fill": lableColorMedium,                
            });

        var perc = objMainData.append("tspan").text(function(d) {
            return d.perc + "%";
        }).style({
            "stroke": lableColorMedium,
            "stroke-width": "1px",
            "fill": lableColorMedium,
        });

        var value = objMainData.append("tspan").text(function(d) {
            return _this.numbFormat(d[_this.name]);
        })
        .attr("dx", "10")
        .style({
            "stroke": lableColorLight,
            "stroke-width": "1px",
            "fill": lableColorLight,
        });


        objMainData.attr("y", "77%")
            .attr("x", objInfoX);

        objMainData.update = function(updateObj) {
            perc.data(updateObj.data).text(function(d) { return d.perc + "%";});
            value.data(updateObj.data).text(function(d) { return _this.numbFormat(d[_this.name]);});

            this.attr("y", "77%")
            .attr("x", objInfoX);
        };
    };

    // RatioChart.prototype.renderLineChart = function(svg) {
    //     var _this = this;



    // };

    RatioChart.prototype.update = function(objA, objB) {
        var _this = this;
        var renderObject = _this.prepareRenderObject(objA, objB);

        arcs.update(renderObject);
        sumElement.text(_this.numbFormat(renderObject.total));
        objMainData.update(renderObject);
    };

    RatioChart.prototype.render = function(objA, objB) {
        var _this = this;
        var renderObject = _this.prepareRenderObject(objA, objB);
        containerWidth = _this.container.node().getBoundingClientRect().width;
        containerHeight = _this.container.node().getBoundingClientRect().height;

        var svg = _this.container.data([renderObject]).append("svg")                       
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        _this.renderArcs(svg);
        _this.renderInnerStrokesCyrcle(svg);
        _this.renderInfo(svg);
        // _this.renderLineChart(svg);
    };

    return RatioChart;
});
