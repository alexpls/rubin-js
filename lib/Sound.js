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