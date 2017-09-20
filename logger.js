(function (global, factory) {

    'use strict';

    /* Use AMD */
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return new (factory(global, global.document))();
        });
    }
    /* Use CommonJS */
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = new (factory(global, global.document))();
    }
    /* Use Browser */
    else {
        global.Logger = new (factory(global, global.document))();
    }

})(typeof window !== 'undefined' ? window : this, function (w, d) {

    var Logger = function () {

        var 
        self = this;

        var API_URL = "https://j8i46y00w8.execute-api.us-east-1.amazonaws.com/dev";

        self.init = _init;
        function _init(key, app, options) {
            if(!key)
                _error('Key missing');
            if(!app)
                _error('App ID missing');
            self.options = options || {
                sendConsoleErrors: true,
                overrideConsoleLog: true,
                debug: false 
            };

            self.key = key;
            self.app_id = app;
            if(self.options.sendConsoleErrors)
                _sendConsoleError();
            if(self.options.overrideConsoleLog)
                _ourConsoleLog();
        }

        function _sendConsoleError() {
            var _onerror = window.onerror;
            //send console error messages to Loggly
            window.onerror = function (msg, url, line, col){
                _sendEvent({ 
                    category: 'BrowserJsException',
                    exception: {
                        message: msg,
                        url: url,
                        lineno: line,
                        colno: col,
                    }
                });

                if (_onerror && typeof _onerror === 'function') {
                    _onerror.apply(window, arguments);
                }
            };
        }

        function _ourConsoleLog() {
            var c = window.console;
    		var _log = console.log;
    		window.console.log = function() {
        		_sendEvent(arguments);
        		_log.apply(c, arguments);
    		}
        }

        self.log = _sendEvent;
        function _sendEvent(data) {
            try {
                var _metadata = {
                    platform: navigator.platform,
                    userAgent: navigator.userAgent,
                    app: navigator.appCodeName
                }
                var xhr = new XMLHttpRequest();   
                xhr.open("POST", API_URL + '/event');
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                var params = {
                    'data': data,
                    '_metadata': _metadata,
                    'app_id': self.app_id,
                    'key': self.key
                }
                xhr.send(JSON.stringify(params));
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        _log(xhr.responseText);
                        return true;
                    }
                }
            } catch (ex) {
                if (window && window.console && typeof window.console.log === 'function') {
                    console.log("Failed to log because of this exception:\n" + ex);
                    console.log("Failed log data:", data);
                }
            }
        }

        function _error(data) {
            console.error('[LOGGER]', data);
        }

        function _log(data) {
            if(self.options.debug)
                console.log('[LOGGER]', data);
        }

    }

    return Logger;

});
