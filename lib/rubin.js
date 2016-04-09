'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Sound = require('./Sound');

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