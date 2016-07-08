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
        updateNumbRange: 1500,
        updateTimeStep: 2000,
        onUpdate: updateCharts,
    });

    dataService.loadData().then(function() {
        var data = dataService.get({
            property: 'revenue',
            count: 10,
            leftentry: 'tablet',
            rightentry: 'smartphone'
        });
        update(data);
    });

    var charts = [];

    function updateCharts(data) {
        charts[0].prepareRenderObject(data.tablet, data.smartphone);
    }
    
    function createCharts() {
        var ratioOneContainer = d3.select('body')
         .append('div').attr('class', 'chart');
        var ratioChartOne = new RatioChart({
            dataKey: "revenue",
            container: ratioOneContainer,
            isCurrency: true,
            colorScheme: "green",
            leftSideObjKey: "tablet",
            rightSideObjKey: "smartphone",
        });

        var ratioTwoContainer = d3.select('body')
            .append('div').attr('class', 'chart');
        var ratioChartTwo = new RatioChart({
            dataKey: "impresions",
            container: ratioTwoContainer,
            isCurrency: false,
            colorScheme: "blue",
            leftSideObjKey: "tablet",
            rightSideObjKey: "smartphone",
        });

        charts = [
            ratioChartOne,
            ratioChartTwo
        ];
    }
});
