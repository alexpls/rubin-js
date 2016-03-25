import Sound from './lib/Sound'
import SoundStates from './lib/SoundStates'

class Rubin {
  constructor() {
    this.sounds = {}
    this.loadQueue = []
  }

  preloadSounds(soundConfigs) {
    soundConfigs.forEach((soundConfig) => {
      if (!this.sounds[soundConfig.key]) {
        const newSound = this.addSound(soundConfig)
        this.loadQueue.push(newSound)
      } else {
        console.log(`${soundsConfig.key} was already added, not adding it again`)
      }
    })
  }

  getSound(key, state) {
    state = state || SoundStates.ready

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
    const s = new Sound(soundConfig)
    this.sounds[soundConfig.key] = s
    return s
  }
}

if (window) {
  window.Rubin = Rubin
}

module.exports = Rubin
