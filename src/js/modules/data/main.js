define(function(require) {
    function Data() {
        this.dataEntries = [{
        		'name': 'tablet',
        		'revenue': 120000,
        		'impresions': 30000000,
        		'visits': 120000000
        	},{
        		'name': 'smartphone',
        		'revenue': 80000,
        		'impresions': 20000000,
        		'visits': 480000000
        	}
        ];
        this.subscriptions = [];        
    }

    Data.prototype.subscribe = function(func) {
    	var _this = this;
        for (var i = 0; i < _this.subscriptions.length; i++) {
            if (_this.subscriptions[i] === func) {
                return;
            }
        }
        _this.subscriptions.push(func);
        _this._notifyCreate(func);
    };

    Data.prototype.unsubscribe = function(func) {
    	var _this = this;
        for (var i = 0; i < _this.subscriptions.length; i++) {
            if (_this.subscriptions[i] === func) {
                _this.subscriptions.splice(i, 1);
            }
        }
    };

    Data.prototype._notifyEntry = function(notifyType , entry, func) {
        func(notifyType + '.' + entry.name, entry);        
    };

    Data.prototype._notifyCreate = function(func) {
        var _this = this;
        for (var i = 0; i < _this.dataEntries.length; i++) {
        	_this._notifyEntry('create', _this.dataEntries[i], func);
        }
    };

    Data.prototype._notifyUpdate = function(entry) {
    	var _this = this;
        for (var i = 0; i < _this.subscriptions.length; i++) {            
            _this._notifyEntry('update', entry, _this.subscriptions[i]);
        }
    };

    Data.prototype.startUpdateSimulator = function() {
        var _this = this;
        var myVar = setInterval(myTimer, 1000);
        function myTimer() {
            for (var i = 0; i < _this.dataEntries.length; i++) {
                var entry = _this.dataEntries[i];
                for(var key in entry) {                    
                    if (typeof entry[key] === 'number') {
                        entry[key] += Math.floor((Math.random() * 1000) + 1);
                    }
                }
                _this._notifyUpdate(entry);
            }            
        }
    };

    return Data;
});