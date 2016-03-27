import StateMachine from 'javascript-state-machine'

import SoundURL from './SoundURL'

class Sound {
  constructor(context, opts) {
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

    if (!(context instanceof window.AudioContext)) {
      throw new Error('Must be instantiated with valid AudioContext');
    }
    this.context = context

    this.buffer = null
    this.source = null
  }

  load() {
    this.state.load()

    loadBufferFromURL(this.context, this.urls[0].url).then((loadedBuffer) => {
      this.buffer = loadedBuffer
      this.state.loaded()
    })

    return this.waitForState('ready')
  }

  makeAudioSource() {
    this.source = this.context.createBufferSource()
    this.source.buffer = this.buffer
    this.source.connect(this.context.destination)
  }

  play() {
    if (!this.state.is('ready')) { return; }

    return new Promise((resolve, reject) => {
      this.makeAudioSource()
      this.source.start()
      this.source.onended = resolve
    })
  }

  parseUrls(urls) {
    return urls.map(url => new SoundURL(url.url, url.type))
  }

  waitForState(state) {
    return new Promise((resolve, reject) => {
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

function loadBufferFromURL(context, url) {
  return new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest()
    let buffer = null

    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      context.decodeAudioData(request.response, (decodedBuffer) => {
        buffer = decodedBuffer
        resolve(buffer)
      }, () => {
        reject()
      })
    }
    request.onerror = () => { reject() }
    request.ontimeout = () => { reject() }

    request.send()
  })
}


module.exports = Sound
