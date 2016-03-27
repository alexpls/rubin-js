import Rubin from '../rubin'

const soundConfig = { key: 'woof', urls: [{ type: 'mp3', url: 'woof.mp3' }] };

describe('Rubin', () => {

  describe('instantiation', () => {
    it('instantiates without any arguments', () => {
      const r = new Rubin();
      expect(r).to.be.a(Rubin);
    })

    it('creates an empty sound pool and preload queue', () => {
      const r = new Rubin();
      expect(Object.keys(r.sounds).length).to.be(0);
      expect(r.loadQueue.length).to.be(0);
    })
  })

  describe('addSound', () => {
    it('adds a sound to the sounds object, using it\'s key as the key', () => {
      const r = new Rubin();
      r.addSound(soundConfig);
      expect(Object.keys(r.sounds).length).to.be(1);
      expect(r.sounds[soundConfig.key].urls[0].url).to.be(soundConfig.urls[0].url);
    })
  })

  describe('getSound', () => {
    beforeEach(function() {
      this.rubin = new Rubin();
      this.rubin.addSound(soundConfig);
    })

    it('returns a promise which resolves when the sound is in the requested state', function(done) {
      const promise = this.rubin.getSound(soundConfig.key, 'initialized');
      expect(promise).to.be.a(Promise);
      promise.then((sound) => {
        expect(sound.key).to.be(soundConfig.key);
        expect(sound.state.is('initialized')).to.be(true);
        done();
      })
    })

    it('defaults to a sound\'s ready state if no state passed in', function(done) {
      this.rubin.getSound(soundConfig.key).then((sound) => {
        expect(sound.state.is('ready')).to.be(true);
        done();
      })
    })
  })

})
