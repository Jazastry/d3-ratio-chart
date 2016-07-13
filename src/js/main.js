require.config({
    baseUrl: 'js',
    paths: {
        d3: 'lib/d3/d3',
        ratioChart: 'modules/ratiochart/main',
        dataService: 'modules/data/main',
        utils: 'modules/utils/utils',
        tbletData: 'modules/data/jstablet-table.tsv',
        promise: 'lib/d3/d3promise'
    }
});

define(function(require) {
    require('promise');
    var d3 = require('d3');
    var DataModule = require('dataService');
    var RatioChart = require('ratioChart');

    var dataService = new DataModule({
        updateNumbRange: 200000,
        updateTimeStep: 2000,
        onUpdate: updateCharts,
    });

    dataService.loadData()
        .then(function() {
            createCharts();
            updateCharts();
            dataService.startUpdateSimulator();
        });

    var charts = [];
    function updateCharts() {
        var data,
            queryPropertyes = {
                property: '',
                count: 10,
                leftEntry: 'tablet',
                rightEntry: 'smartphone'
            };

        for (var i = 0; i < charts.length; i++) {
            queryPropertyes.property = charts[i].name;
            data = dataService.get(queryPropertyes);
            updateChart(data);
        }
    }

    function updateChart(data) {
        var chart = charts.filter(function(obj) {
            return obj.name === data.property;
        })[0];
        chart.update(data);
    }

    function createCharts() {
        var chartProperties = [{
            name: 'revenue',
            colorScheme: 'green',
            isCurrency: true
        }, {
            name: 'impressions',
            colorScheme: 'blue'
        }, {
            name: 'visits',
            colorScheme: 'yellow'
        }],
            chart;

        for (var i = 0; i < chartProperties.length; i++) {
            chart = createChart(chartProperties[i]);
            charts.push(chart);
        }
    }

    function createChart(prop) {
        var container = d3.select('body')
            .append('div').attr('class', 'chart');
        var chart = new RatioChart({
            dataKey: prop.name,
            container: container,
            isCurrency: prop.isCurrency,
            colorScheme: prop.colorScheme,
            leftSideObjKey: "tablet",
            rightSideObjKey: "smartphone",
        });

        return chart;
    }
});
