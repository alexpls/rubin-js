'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _Sound = require('./Sound');

var _Sound2 = _interopRequireDefault(_Sound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rubin = function (_EventEmitter) {
  _inherits(Rubin, _EventEmitter);

  function Rubin() {
    _classCallCheck(this, Rubin);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Rubin).call(this));

    _this.sounds = {};
    _this.loadQueue = [];
    _this.context = new window.AudioContext();
    return _this;
  }

  _createClass(Rubin, [{
    key: 'preloadSounds',
    value: function preloadSounds(soundConfigs) {
      var _this2 = this;

      var cb = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      soundConfigs.forEach(function (soundConfig) {
        if (!_this2.sounds[soundConfig.key]) {
          var newSound = _this2.addSound(soundConfig);
          _this2.loadQueue.push(newSound);
        } else {
          console.log(soundsConfig.key + ' was already added, not adding it again');
        }
      });

      this.startLoadingFromQueue(cb);
    }
  }, {
    key: 'getSound',
    value: function getSound(key, state) {
      var _this3 = this;

      state = state || 'ready';

      return new Promise(function (resolve, reject) {
        var s = _this3.sounds[key];
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
      var _this4 = this;

      var cb = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

      if (this.loadQueue.length === 0) {
        return;
      }

      // how many sounds to load at one time?
      var asyncLoadCount = 2;
      var loadedSounds = [];

      var startLoadingSound = function startLoadingSound(sound) {
        sound.load().then(function () {
          loadedSounds.push(sound);
          _this4.emit('preloadedSound', sound);

          // remove the sound from the load queue once it's ready to be played
          var soundIdx = _this4.loadQueue.indexOf(sound);
          _this4.loadQueue.splice(soundIdx, 1);

          // checks if we've loaded all the sounds already
          if (_this4.loadQueue.length === 0) {
            _this4.emit('preloadedAllSounds');
            cb(null, loadedSounds);
            return;
          }

          // find the next sound that's not loading in the queue and
          // start loading it!
          _this4.loadQueue.some(function (soundInQueue) {
            if (soundInQueue.state.is('initialized')) {
              startLoadingSound(soundInQueue);
              return true;
            }
          });
        });
      };

      // kick off the load
      this.loadQueue.slice(0, asyncLoadCount).forEach(function (sound) {
        startLoadingSound.call(_this4, sound);
      });
    }
  }]);

  return Rubin;
}(_events.EventEmitter);

if (typeof window !== 'undefined') {
  window.Rubin = Rubin;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
} else {
  global.window = {};
}

module.exports = Rubin;