import { EventEmitter } from 'events'
import Sound from './Sound'

class Rubin extends EventEmitter {
  constructor() {
    super()
    this.sounds = {}
    this.loadQueue = []
    this.context = new window.AudioContext()
  }

  preloadSounds(soundConfigs, cb = function() {}) {
    soundConfigs.forEach((soundConfig) => {
      if (!this.sounds[soundConfig.key]) {
        const newSound = this.addSound(soundConfig)
        this.loadQueue.push(newSound)
      } else {
        console.log(`${soundsConfig.key} was already added, not adding it again`)
      }
    })

    this.startLoadingFromQueue(cb)
  }

  getSound(key, state) {
    state = state || 'ready'

    return new Promise((resolve, reject) => {
      const s = this.sounds[key]
      if (s) {
        s.waitForState(state).then(() => { resolve(s) });
      } else {
        reject()
      }
    })
  }

  addSound(soundConfig) {
    const s = new Sound(this.context, soundConfig)
    this.sounds[soundConfig.key] = s
    return s
  }

  startLoadingFromQueue(cb = function() {}) {
    if (this.loadQueue.length === 0) { return; }

    // how many sounds to load at one time?
    const asyncLoadCount = 2
    let loadedSounds = []

    var startLoadingSound = (sound) => {
      sound.load().then(() => {
        loadedSounds.push(sound)
        this.emit('preloadedSound', sound)

        // remove the sound from the load queue once it's ready to be played
        const soundIdx = this.loadQueue.indexOf(sound)
        this.loadQueue.splice(soundIdx, 1)

        // checks if we've loaded all the sounds already
        if (this.loadQueue.length === 0) {
          this.emit('preloadedAllSounds')
          cb(null, loadedSounds)
          return
        }

        // find the next sound that's not loading in the queue and
        // start loading it!
        this.loadQueue.some(function(soundInQueue) {
          if (soundInQueue.state.is('initialized')) {
            startLoadingSound(soundInQueue)
            return true
          }
        })
      })
    }

    // kick off the load
    this.loadQueue.slice(0, asyncLoadCount).forEach((sound) => {
      startLoadingSound.call(this, sound)
    })
  }
}

if (typeof window !== 'undefined') {
  window.Rubin = Rubin
  window.AudioContext = window.AudioContext || window.webkitAudioContext
} else {
  global.window = {}
}

module.exports = Rubin
