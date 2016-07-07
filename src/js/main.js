require.config({
    baseUrl: 'js',
    paths: {
        d3: 'lib/d3/d3',
        ratioChart: 'modules/ratiochart/main',
        data: 'modules/data/main',
        utils: 'modules/utils/utils'
    }
});

define(function(require) {
    var d3 = require('d3');
    var data = require('data');
    var dataService = new data();

    var RatioChart = require('ratioChart');

    var RatioOneContainer = d3.select('body')
    	.append('div').attr('class', 'chart');
    var ratioChartOne = new RatioChart({
        "dataKey": "revenue",
        "container": RatioOneContainer,
        "dataService": dataService,
        "isCurrency": true,
        "colorScheme": "green"
    });

    var RatioTwoContainer = d3.select('body')
        .append('div').attr('class', 'chart');
    var ratioChartTwo = new RatioChart({
        "dataKey": "impresions",
        "container": RatioTwoContainer,
        "dataService": dataService,
        "isCurrency": false,
        "colorScheme": "blue"
    });

    dataService.startUpdateSimulator();
});