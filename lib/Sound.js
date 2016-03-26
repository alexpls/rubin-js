import SoundURL from './SoundURL'
import SoundStates from './SoundStates'

class Sound {
  constructor(opts) {
    this.state = SoundStates.initialized
    this.key = opts.key
    this.urls = this.parseUrls(opts.urls)
  }

  parseUrls(urls) {
    return urls.map(url => new SoundURL(url.url, url.type))
  }

  waitForState(state) {
    return new Promise((resolve, reject) => {
      if (!SoundStates[state]) {
        return reject();
      }

      // TODO temporary shortcut to set the state to whatever's been
      // requested.
      this.state = state

      resolve();
    })
  }
}

module.exports = Sound
