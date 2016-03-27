import StateMachine from 'javascript-state-machine'

import SoundURL from './SoundURL'

class Sound {
  constructor(opts) {
    this.state = StateMachine.create({
      initial: 'initialized',
      events: [
        { name: 'load', from: 'initialized', to: 'loading' },
        { name: 'loaded', from: 'loading', to: 'ready' },
        { name: 'error', from: '*', to: 'errored' }
      ]
    })
    this.key = opts.key
    this.urls = this.parseUrls(opts.urls)
  }

  parseUrls(urls) {
    return urls.map(url => new SoundURL(url.url, url.type))
  }

  waitForState(state) {
    return new Promise((resolve, reject) => {
      // TODO temporary shortcut to set the state to whatever's been
      // requested.
      if (state == 'ready') {
        this.state.load();
        this.state.loaded();
      }

      if (this.state.is(state)) {
        resolve();
      } else {
        this.state[`on${state}`] = () => {
          resolve();
          this.state[`on${state}`] = null
        }
      }
    })
  }
}

module.exports = Sound
