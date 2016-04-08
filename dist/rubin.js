(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _javascriptStateMachine = require('javascript-state-machine');

var _javascriptStateMachine2 = _interopRequireDefault(_javascriptStateMachine);

var _SoundURL = require('./SoundURL');

var _SoundURL2 = _interopRequireDefault(_SoundURL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sound = function () {
  function Sound(context, opts) {
    _classCallCheck(this, Sound);

    this.state = _javascriptStateMachine2.default.create({
      initial: 'initialized',
      events: [{ name: 'load', from: 'initialized', to: 'loading' }, { name: 'loaded', from: 'loading', to: 'ready' }, { name: 'error', from: '*', to: 'errored' }]
    });
    this.key = opts.key;
    this.urls = this.parseUrls(opts.urls);

    if (!(context instanceof window.AudioContext)) {
      throw new Error('Must be instantiated with valid AudioContext');
    }
    this.context = context;

    this.buffer = null;
    this.source = null;
  }

  _createClass(Sound, [{
    key: 'load',
    value: function load() {
      var _this = this;

      this.state.load();

      loadBufferFromURL(this.context, this.urls[0].url).then(function (loadedBuffer) {
        _this.buffer = loadedBuffer;
        _this.state.loaded();
      });

      return this.waitForState('ready');
    }
  }, {
    key: 'makeAudioSource',
    value: function makeAudioSource() {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.context.destination);
    }
  }, {
    key: 'play',
    value: function play() {
      var _this2 = this;

      if (!this.state.is('ready')) {
        return;
      }

      return new Promise(function (resolve, reject) {
        _this2.makeAudioSource();
        _this2.source.start();
        _this2.source.onended = resolve;
      });
    }
  }, {
    key: 'parseUrls',
    value: function parseUrls(urls) {
      return urls.map(function (url) {
        return new _SoundURL2.default(url.url, url.type);
      });
    }
  }, {
    key: 'waitForState',
    value: function waitForState(state) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (_this3.state.is(state)) {
          resolve();
        } else {
          _this3.state['on' + state] = function () {
            resolve();
            _this3.state['on' + state] = null;
          };
        }
      });
    }
  }]);

  return Sound;
}();

function loadBufferFromURL(context, url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    var buffer = null;

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      context.decodeAudioData(request.response, function (decodedBuffer) {
        buffer = decodedBuffer;
        resolve(buffer);
      }, function () {
        reject();
      });
    };
    request.onerror = function () {
      reject();
    };
    request.ontimeout = function () {
      reject();
    };

    request.send();
  });
}

module.exports = Sound;

},{"./SoundURL":2,"javascript-state-machine":3}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SoundURL = function () {
  function SoundURL(url, type) {
    _classCallCheck(this, SoundURL);

    if (this.validTypes.indexOf(type) === -1) {
      throw new SyntaxError(type + ' is not a valid sound type');
    }

    this.type = type;
    this.url = url;
  }

  _createClass(SoundURL, [{
    key: 'validTypes',
    get: function get() {
      return ['mp3', 'wav', 'webm'];
    }
  }]);

  return SoundURL;
}();

module.exports = SoundURL;

},{}],3:[function(require,module,exports){
/*

  Javascript State Machine Library - https://github.com/jakesgordon/javascript-state-machine

  Copyright (c) 2012, 2013, 2014, 2015, Jake Gordon and contributors
  Released under the MIT license - https://github.com/jakesgordon/javascript-state-machine/blob/master/LICENSE

*/

(function () {

  var StateMachine = {

    //---------------------------------------------------------------------------

    VERSION: "2.3.5",

    //---------------------------------------------------------------------------

    Result: {
      SUCCEEDED:    1, // the event transitioned successfully from one state to another
      NOTRANSITION: 2, // the event was successfull but no state transition was necessary
      CANCELLED:    3, // the event was cancelled by the caller in a beforeEvent callback
      PENDING:      4  // the event is asynchronous and the caller is in control of when the transition occurs
    },

    Error: {
      INVALID_TRANSITION: 100, // caller tried to fire an event that was innapropriate in the current state
      PENDING_TRANSITION: 200, // caller tried to fire an event while an async transition was still pending
      INVALID_CALLBACK:   300 // caller provided callback function threw an exception
    },

    WILDCARD: '*',
    ASYNC: 'async',

    //---------------------------------------------------------------------------

    create: function(cfg, target) {

      var initial      = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow for a simple string, or an object with { state: 'foo', event: 'setup', defer: true|false }
      var terminal     = cfg.terminal || cfg['final'];
      var fsm          = target || cfg.target  || {};
      var events       = cfg.events || [];
      var callbacks    = cfg.callbacks || {};
      var map          = {}; // track state transitions allowed for an event { event: { from: [ to ] } }
      var transitions  = {}; // track events allowed from a state            { state: [ event ] }

      var add = function(e) {
        var from = (e.from instanceof Array) ? e.from : (e.from ? [e.from] : [StateMachine.WILDCARD]); // allow 'wildcard' transition if 'from' is not specified
        map[e.name] = map[e.name] || {};
        for (var n = 0 ; n < from.length ; n++) {
          transitions[from[n]] = transitions[from[n]] || [];
          transitions[from[n]].push(e.name);

          map[e.name][from[n]] = e.to || from[n]; // allow no-op transition if 'to' is not specified
        }
      };

      if (initial) {
        initial.event = initial.event || 'startup';
        add({ name: initial.event, from: 'none', to: initial.state });
      }

      for(var n = 0 ; n < events.length ; n++)
        add(events[n]);

      for(var name in map) {
        if (map.hasOwnProperty(name))
          fsm[name] = StateMachine.buildEvent(name, map[name]);
      }

      for(var name in callbacks) {
        if (callbacks.hasOwnProperty(name))
          fsm[name] = callbacks[name]
      }

      fsm.current     = 'none';
      fsm.is          = function(state) { return (state instanceof Array) ? (state.indexOf(this.current) >= 0) : (this.current === state); };
      fsm.can         = function(event) { return !this.transition && (map[event].hasOwnProperty(this.current) || map[event].hasOwnProperty(StateMachine.WILDCARD)); }
      fsm.cannot      = function(event) { return !this.can(event); };
      fsm.transitions = function()      { return transitions[this.current]; };
      fsm.isFinished  = function()      { return this.is(terminal); };
      fsm.error       = cfg.error || function(name, from, to, args, error, msg, e) { throw e || msg; }; // default behavior when something unexpected happens is to throw an exception, but caller can override this behavior if desired (see github issue #3 and #17)

      if (initial && !initial.defer)
        fsm[initial.event]();

      return fsm;

    },

    //===========================================================================

    doCallback: function(fsm, func, name, from, to, args) {
      if (func) {
        try {
          return func.apply(fsm, [name, from, to].concat(args));
        }
        catch(e) {
          return fsm.error(name, from, to, args, StateMachine.Error.INVALID_CALLBACK, "an exception occurred in a caller-provided callback function", e);
        }
      }
    },

    beforeAnyEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbeforeevent'],                       name, from, to, args); },
    afterAnyEvent:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafterevent'] || fsm['onevent'],      name, from, to, args); },
    leaveAnyState:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleavestate'],                        name, from, to, args); },
    enterAnyState:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenterstate'] || fsm['onstate'],      name, from, to, args); },
    changeState:     function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onchangestate'],                       name, from, to, args); },

    beforeThisEvent: function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbefore' + name],                     name, from, to, args); },
    afterThisEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafter'  + name] || fsm['on' + name], name, from, to, args); },
    leaveThisState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleave'  + from],                     name, from, to, args); },
    enterThisState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenter'  + to]   || fsm['on' + to],   name, from, to, args); },

    beforeEvent: function(fsm, name, from, to, args) {
      if ((false === StateMachine.beforeThisEvent(fsm, name, from, to, args)) ||
          (false === StateMachine.beforeAnyEvent( fsm, name, from, to, args)))
        return false;
    },

    afterEvent: function(fsm, name, from, to, args) {
      StateMachine.afterThisEvent(fsm, name, from, to, args);
      StateMachine.afterAnyEvent( fsm, name, from, to, args);
    },

    leaveState: function(fsm, name, from, to, args) {
      var specific = StateMachine.leaveThisState(fsm, name, from, to, args),
          general  = StateMachine.leaveAnyState( fsm, name, from, to, args);
      if ((false === specific) || (false === general))
        return false;
      else if ((StateMachine.ASYNC === specific) || (StateMachine.ASYNC === general))
        return StateMachine.ASYNC;
    },

    enterState: function(fsm, name, from, to, args) {
      StateMachine.enterThisState(fsm, name, from, to, args);
      StateMachine.enterAnyState( fsm, name, from, to, args);
    },

    //===========================================================================

    buildEvent: function(name, map) {
      return function() {

        var from  = this.current;
        var to    = map[from] || map[StateMachine.WILDCARD] || from;
        var args  = Array.prototype.slice.call(arguments); // turn arguments into pure array

        if (this.transition)
          return this.error(name, from, to, args, StateMachine.Error.PENDING_TRANSITION, "event " + name + " inappropriate because previous transition did not complete");

        if (this.cannot(name))
          return this.error(name, from, to, args, StateMachine.Error.INVALID_TRANSITION, "event " + name + " inappropriate in current state " + this.current);

        if (false === StateMachine.beforeEvent(this, name, from, to, args))
          return StateMachine.Result.CANCELLED;

        if (from === to) {
          StateMachine.afterEvent(this, name, from, to, args);
          return StateMachine.Result.NOTRANSITION;
        }

        // prepare a transition method for use EITHER lower down, or by caller if they want an async transition (indicated by an ASYNC return value from leaveState)
        var fsm = this;
        this.transition = function() {
          fsm.transition = null; // this method should only ever be called once
          fsm.current = to;
          StateMachine.enterState( fsm, name, from, to, args);
          StateMachine.changeState(fsm, name, from, to, args);
          StateMachine.afterEvent( fsm, name, from, to, args);
          return StateMachine.Result.SUCCEEDED;
        };
        this.transition.cancel = function() { // provide a way for caller to cancel async transition if desired (issue #22)
          fsm.transition = null;
          StateMachine.afterEvent(fsm, name, from, to, args);
        }

        var leave = StateMachine.leaveState(this, name, from, to, args);
        if (false === leave) {
          this.transition = null;
          return StateMachine.Result.CANCELLED;
        }
        else if (StateMachine.ASYNC === leave) {
          return StateMachine.Result.PENDING;
        }
        else {
          if (this.transition) // need to check in case user manually called transition() but forgot to return StateMachine.ASYNC
            return this.transition();
        }

      };
    }

  }; // StateMachine

  //===========================================================================

  //======
  // NODE
  //======
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = StateMachine;
    }
    exports.StateMachine = StateMachine;
  }
  //============
  // AMD/REQUIRE
  //============
  else if (typeof define === 'function' && define.amd) {
    define(function(require) { return StateMachine; });
  }
  //========
  // BROWSER
  //========
  else if (typeof window !== 'undefined') {
    window.StateMachine = StateMachine;
  }
  //===========
  // WEB WORKER
  //===========
  else if (typeof self !== 'undefined') {
    self.StateMachine = StateMachine;
  }

}());

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Sound = require('./lib/Sound');

var _Sound2 = _interopRequireDefault(_Sound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rubin = function () {
  function Rubin() {
    _classCallCheck(this, Rubin);

    this.sounds = {};
    this.loadQueue = [];
    this.context = new window.AudioContext();
  }

  _createClass(Rubin, [{
    key: 'preloadSounds',
    value: function preloadSounds(soundConfigs) {
      var _this = this;

      soundConfigs.forEach(function (soundConfig) {
        if (!_this.sounds[soundConfig.key]) {
          var newSound = _this.addSound(soundConfig);
          _this.loadQueue.push(newSound);
        } else {
          console.log(soundsConfig.key + ' was already added, not adding it again');
        }
      });

      this.startLoadingFromQueue();
    }
  }, {
    key: 'getSound',
    value: function getSound(key, state) {
      var _this2 = this;

      state = state || 'ready';

      return new Promise(function (resolve, reject) {
        var s = _this2.sounds[key];
        if (s) {
          s.waitForState(state).then(function () {
            resolve(s);
          });
        } else {
          reject();
        }
      });
    }
  }, {
    key: 'addSound',
    value: function addSound(soundConfig) {
      var s = new _Sound2.default(this.context, soundConfig);
      this.sounds[soundConfig.key] = s;
      return s;
    }
  }, {
    key: 'startLoadingFromQueue',
    value: function startLoadingFromQueue() {
      if (this.loadQueue.length === 0) {
        return;
      }

      // how many sounds to load at one time?
      var asyncLoadCount = 2;

      var startLoadingSound = function startLoadingSound(sound) {
        sound.load().then(function () {
          // remove the sound from the load queue once it's ready to be played
          var soundIdx = this.loadQueue.indexOf(sound);
          this.loadQueue.splice(soundIdx, 1);

          // checks if we've loaded all the sounds already
          if (this.loadQueue.length === 0) {
            return;
          }

          // find the next sound that's not loading in the queue and
          // start loading it!
          this.loadQueue.some(function (soundInQueue) {
            if (soundInQueue.state.is('initialized')) {
              startLoadingSound(soundInQueue);
              return true;
            }
          });
        });
      };

      // kick off the load
      this.loadQueue.slice(0, asyncLoadCount).forEach(function (sound) {
        startLoadingSound(sound);
      });
    }
  }]);

  return Rubin;
}();

if (typeof window !== 'undefined') {
  window.Rubin = Rubin;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
} else {
  global.window = {};
}

module.exports = Rubin;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/Sound":1}]},{},[4]);
