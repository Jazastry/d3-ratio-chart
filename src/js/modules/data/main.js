define(function(require) {
    utils = require('utils');
    function Data(options) {
        this.data = {};
        this.updateNumbRange = options.updateNumbRange;
        this.updateTimeStep = options.updateTimeStep;
        this.onUpdate = options.onUpdate;
    }

    Data.prototype.loadData = function() {
        var _this = this;

        function type(d) {
            d = {
                'revenue': +d.revenue,
                'impressions': +d.impressions,
                'visits': +d.visits,
                'timeindex': +d.timeindex,
                'device': d.device,
            };
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

        function caalcTotal(arr) {
            return arr.reduce(function(prev, curr) {
                return prev + curr;
            });
        }

        var leftEntry = {
            name: options.leftentry,
            vals: last(options.count, _this.data[options.leftentry], options.property)                      
        };
        leftEntry.total = caalcTotal(leftEntry.vals);

        var rightEntry = {
            name: options.rightentry,
            vals: last(options.count, _this.data[options.rightentry], options.property)            
        };
        rightEntry.total = caalcTotal(rightEntry.vals);

        var total = leftEntry.total + rightEntry.total;
        leftEntry.percentage = utils.percentageFromWhole(total, leftEntry.total);
        rightEntry.percentage = utils.percentageFromWhole(total, rightEntry.total);

        return {
            property: options.property,
            leftEntry: leftEntry,
            rightEntry: rightEntry,
            total: leftEntry.total + rightEntry.total,
            ratio: rightEntry.percentage
        };
    };

    Data.prototype.startUpdateSimulator = function() {
        var _this = this;
        var myVar = setInterval(myTimer, _this.updateTimeStep);

        function myTimer() {



            _this.onUpdate(_this.data);
        }
    };

    return Data;
});
