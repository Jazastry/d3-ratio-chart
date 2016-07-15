define(function(require) {
    var d3 = require('d3'),
        utils = require('utils'),
        _minAngle = 0,
        _midAngle = 50,
        _maxAngle = 100,
        _aColor,
        _bColor,
        _strokeColor,
        _lableColorLight = '#B2B2B2',
        _lableColorMedium = '#8A8A8A',
        _lableColorDark = '#393939',
        _backColor = '#FFF',
        _cyrclePadding = 55,
        _objInfoPadding = 10,
        _ratioCyrcleThickness = 13,
        _strokesCount = 4,
        _strokesThickness = 0.5,
        _strokesCyrcleThickness = 5,
        _containerWidth,
        _containerHeight;

    function RatioChart(options) {
        this.name = options.dataKey;
        this.container = options.container;
        this.dataService = options.dataService;
        this.isCurrency = options.isCurrency ? options.isCurrency : false;
        this.subscriptionFunction = null;
        this.colorScheme(options.colorScheme);
        this.keyA = options.leftSideObjKey;
        this.keyB = options.rightSideObjKey;
        this._arcs = {};
        this._infoSectionData = {};
        this._sumElement = {};
        this._mainObjectsData = {};

        this.render();
    }

    RatioChart.prototype.colorScheme = function(name) {
        switch (name) {
            case 'green':
                _aColor = '#56D32E';
                _bColor = '#086501';
                _strokeColor = '#B9C3A0';
                break;
            case 'yellow':
                _aColor = '#F8C104';
                _bColor = '#D65111';
                _strokeColor = '#BBB990';
                break;
            case 'blue':
                _aColor = '#17C4E4';
                _bColor = '#114F66';
                _strokeColor = '#B8B8B8';
                break;
            default:
                break;
        }
    };

    RatioChart.prototype.renderArcs = function(svg) {
        var _this = this;
        var outR = (_containerWidth / 2) - (2 * _cyrclePadding);
        var inR = outR - _ratioCyrcleThickness;
        var translateX = _containerWidth / 2;
        var translateY = translateX - _cyrclePadding;

        var arc = d3.svg.arc()
            .innerRadius(inR)
            .outerRadius(outR)
            .startAngle(utils.cScale(_minAngle));

        var arcsGroup = svg.append("g")
            .attr("transform", "translate(" + translateX + ", " + translateY + ")");

        var background = arcsGroup.append("path")
            .datum({
                endAngle: utils.cScale(_maxAngle)
            })
            .style("fill", _aColor)
            .attr("d", arc);

        var foreground = arcsGroup.append("path")
            .datum({
                //TODO: add _midAngle variable
                endAngle: utils.cScale(_maxAngle)
            })
            .style("fill", _bColor)
            .attr("d", arc);

        _this._arcs.update = function(updateObj) {
            foreground.transition().duration(685).attrTween("d", function(d) {
                var interpolate = d3.interpolate(d.endAngle, utils.cScale(updateObj.ratio));
                return function(t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                };
            });
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
            var end = _strokesThickness;
            for (var i = 0; i < _strokesCount + 1; i++) {
                res.push({
                    startAngle: start,
                    endAngle: end,
                    color: _strokeColor
                });

                start += 25;
                res.push({
                    startAngle: end,
                    endAngle: start,
                    color: _backColor
                });
                end += 25;
            }
            return res.reverse();
        }());

        var outR = (_containerWidth / 2) - (2 * _cyrclePadding) - (_ratioCyrcleThickness + 2);
        var inR = outR - _strokesCyrcleThickness;
        var arc = _this.arc(inR, outR);

        var translateX = _containerWidth / 2;
        var translateY = translateX - _cyrclePadding;

        svg.selectAll("path")
            .data(strokesData).enter()
            .append("path").attr("d", arc)
            .style("fill", function(d) {
                return d.color;
            })
            .attr("transform", "translate(" + translateX + ", " + translateY + ")");
    };

    RatioChart.prototype.prepareRenderObject = function(data) {
        var _this = this;
        var renderObject = {};

        if (data) {
            renderObject = JSON.parse(JSON.stringify(data));

            renderObject.data[1].startAngle = _minAngle;
            renderObject.data[1].endAngle = data.data[1].percentage;
            renderObject.data[1].color = _bColor;

            renderObject.data[0].startAngle = data.data[1].percentage;
            renderObject.data[0].endAngle = _maxAngle;
            renderObject.data[0].color = _aColor;

            return renderObject;
        } else {
            renderObject = {
                ratio: 50,
                data: [{
                    'perc': 50,
                    'startAngle': 50,
                    'endAngle': _maxAngle,
                    'color': _aColor,
                    'name': _this.keyA,
                    'values': []
                }, {
                    'perc': 50,
                    'startAngle': _minAngle,
                    'endAngle': 50,
                    'color': _bColor,
                    'name': _this.keyB,
                    'values': []
                }],
                total: 0
            };
        }

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
            return d.name === _this.keyA ? _objInfoPadding + "px" :
                ((_containerWidth - _objInfoPadding) - thisWidth) + "px";
        }

        var mainInfoContainer = svg.append("g").style({
            "text-anchor": "middle",
            "font-weight": 100
        });

        var mainLabelElement = mainInfoContainer.append("text")
            .attr("d", "text")
            .style({
                "font-size": 29,
                "stroke": _lableColorLight,
                "stroke-width": "1px",
                "fill": _lableColorLight,
                "letter-spacing": 1,
            })
            .attr("x", "50%")
            .attr("y", "32%")
            .attr("dy", ".16em")
            .text(function(d) {
                return _this.name.toUpperCase();
            });

        _this._sumElement = mainInfoContainer.append("text")
            .style({
                "font-size": 39,
                "stroke": _lableColorDark,
                "stroke-width": "2px",
                "fill": _lableColorDark,
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

        _this._infoSectionData = svg.append("g");
        _this._mainObjectsData = _this._infoSectionData.selectAll("text")
            .data(function(d) {
                return d.data;
            }).enter()
            .append("g")
            .append("text")
            .style({
                "stroke": _lableColorMedium,
                "stroke-width": "1px",
                "fill": _lableColorMedium,
            });

        var perc = _this._mainObjectsData.append("tspan").text(function(d) {
            return d.perc + "%";
        }).style({
            "stroke": _lableColorMedium,
            "stroke-width": "1px",
            "fill": _lableColorMedium,
        });

        var value = _this._mainObjectsData.append("tspan").text(function(d) {
                return _this.numbFormat(d[_this.name] ? d[_this.name] : 0);
            })
            .attr("dx", "10")
            .style({
                "stroke": _lableColorLight,
                "stroke-width": "1px",
                "fill": _lableColorLight,
            });


        _this._mainObjectsData.attr("y", "77%")
            .attr("x", objInfoX);

        _this._mainObjectsData.update = function(updateObj) {
            perc.data(updateObj.data).text(function(d) {
                return d.percentage + "%";
            });
            value.data(updateObj.data).text(function(d) {
                return _this.numbFormat(d.total);
            });

            this.attr("y", "77%")
                .attr("x", objInfoX);
        };
    };

    RatioChart.prototype.renderLineChart = function(svg) {
        var _this = this;
        var data = [
            {x:0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 46},
            {x: 3, y: 20},
            {x: 4, y: 22},
            {x: 5, y: 33},
            {x: 6, y: 10},
            {x: 7, y: 3},
            {x: 8, y: 0},
            {x: 9, y: 100}
        ];
        // var data = [
        //     {x:0, y:10},
        //     {x: 1, y: 15},
        //     {x: 2, y: 35},
        //     {x: 3, y: 20},
        //     {x: 4, y: 22},
        //     {x: 5, y: 33},
        //     {x: 6, y: 10},
        //     {x: 7, y: 3},
        //     {x: 8, y: 27},
        //     {x: 9, y: 88},
        //     {x: 10, y: 50}
        // ];

        var translateX =  _cyrclePadding * 2 + _ratioCyrcleThickness + (2 *_strokesCyrcleThickness),
            width = _containerWidth - (4 * _cyrclePadding) - (2 * _ratioCyrcleThickness) - (4 * _strokesCyrcleThickness),
            height = _containerHeight / 4.8,
            translateY = (_containerHeight / 100) * 43;

        // var outR = (_containerWidth / 2) - (2 * _cyrclePadding) - (_ratioCyrcleThickness + 2) - _strokesThickness;
        // var inR = outR - _strokesCyrcleThickness;
        // // _cyrclePadding = 55,
        // _objInfoPadding = 10,
        // _ratioCyrcleThickness = 13,
        // _strokesCount = 4,
        // _strokesThickness = 0.5,
        // _strokesCyrcleThickness = 5,
        // _containerWidth,
        // _containerHeight;


        var x = d3.scale.linear()
            .domain([0, d3.max(data, function(d) {
                return d.x;
            })])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) {
                return d.y;
            })])
            .range([height, 0]);

        var test = d3.scale.linear()
            .domain([0, 100])
            .range([50, 100]);

         console.log(test(10));

        var area = d3.svg.area()
            .x(function(d) {                
                return x(d.x);
            })
            .y0(height)
            .y1(function(d) {
                return y(d.y);
            });


        var g = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + translateX + "," + translateY + ")");

        g.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);
    };

    RatioChart.prototype.update = function(data) {
        var _this = this;
        var renderObject = _this.prepareRenderObject(data);

        _this._arcs.update(renderObject);
        _this._sumElement.text(_this.numbFormat(renderObject.total));
        _this._mainObjectsData.update(renderObject);
    };

    RatioChart.prototype.render = function() {
        var _this = this;
        var renderObject = _this.prepareRenderObject();
        _containerWidth = _this.container.node().getBoundingClientRect().width;
        _containerHeight = _this.container.node().getBoundingClientRect().height;

        var svg = _this.container.data([renderObject]).append("svg")
            .attr("width", _containerWidth)
            .attr("height", _containerHeight);

       
        
        _this.renderLineChart(svg);

        _this.renderInfo(svg);

        _this.renderArcs(svg);
        _this.renderInnerStrokesCyrcle(svg);
    };

    return RatioChart;
});
