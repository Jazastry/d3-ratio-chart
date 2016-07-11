define(function(require) {
    utils = require('utils');

    function Data(options) {
        this.data = {};
        this.updateNumbRange = options.updateNumbRange;
        this.updateTimeStep = options.updateTimeStep;
        this.onUpdate = options.onUpdate;
    }

    Data.prototype.newRandomData = function(deviceName) {
        var _this = this;

        return {
            'revenue': utils.randomInt(_this.updateNumbRange),
            'impressions': utils.randomInt(_this.updateNumbRange),
            'visits': utils.randomInt(_this.updateNumbRange),
            'timeindex': _this.data[deviceName].length,
            'device': deviceName,
        };
    };

    Data.prototype.loadData = function() {
        var _this = this;

        function type(d) {
            d.revenue = +d.revenue;
            d.impressions = +d.impressions;
            d.visits = +d.visits;
            d.timeindex = +d.timeindex;
            d.device = d.device;

            return d;
        }

        var promiseTabletData = d3.promise
            .csv('./js/modules/data/tablet-table.csv', type);
        var promiseSmartphoneData = d3.promise
            .csv('./js/modules/data/smartphone-table.csv', type);

        return promiseTabletData.then(function(d) {
            _this.data.tablet = d;
            return promiseSmartphoneData;
        }).then(function(d) {
            _this.data.smartphone = d;
        });
    };

    Data.prototype.get = function(options) {
        var _this = this;

        function last(count, arr, prop) {
            var res = [];
            for (var i = arr.length - 1; i > arr.length - (count + 1); i--) {
                if (arr[i][prop]) {
                    res.push(arr[i][prop]);
                }
            }
            return res.reverse();
        }

        function total(arr) {
            return arr.reduce(function(prev, curr) {
                return prev + curr;
            });
        }

        var leftEntry = {
            name: options.leftEntry,
            values: last(options.count, _this.data[options.leftEntry], options.property)
        };
        leftEntry.total = total(leftEntry.values);

        var rightEntry = {
            name: options.rightEntry,
            values: last(options.count, _this.data[options.rightEntry], options.property)
        };
        rightEntry.total = total(rightEntry.values);

        var totalOverall = leftEntry.total + rightEntry.total;
        leftEntry.percentage = utils.percentageFromWhole(totalOverall, leftEntry.total);
        rightEntry.percentage = utils.percentageFromWhole(totalOverall, rightEntry.total);

        return {
            property: options.property,
            leftEntry: leftEntry,
            rightEntry: rightEntry,
            total: totalOverall,
            ratio: rightEntry.percentage,
            data: [leftEntry, rightEntry]
        };
    };

    Data.prototype.startUpdateSimulator = function() {
        var _this = this;
        var myVar = setInterval(myTimer, _this.updateTimeStep);

        function myTimer() {
            for (var deviceName in _this.data) {
                var newData = _this.newRandomData(deviceName);
                _this.data[deviceName].push(newData);
            }

            _this.onUpdate();
        }
    };

    return Data;
});
