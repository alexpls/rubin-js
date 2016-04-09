import Sound from '../src/Sound'

describe('Sound', function() {
  before(function() {
    this.context = new window.AudioContext();
    this.exampleSoundConfig = {
      key: 'woof',
      urls: [
        { type: 'wav', url: 'http://example.org/woof.wav' }
      ]
    };
  });

  describe('instantiation', function() {
    it('instantiates with an options object', function() {
      const sound = new Sound(this.context, this.exampleSoundConfig);
      expect(sound).to.be.a(Sound);
    });

    it('instantiates with an AudioContext', function() {
      var shouldThrow = () => {
        new Sound(null, this.exampleSoundConfig)
      }

      expect(shouldThrow).to.throwError(/must be instantiated with valid AudioContext/i)
    })

    it('creates a null buffer and source', function() {
      const sound = new Sound(this.context, this.exampleSoundConfig)
      expect(sound.buffer).to.be(null)
      expect(sound.source).to.be(null)
    })
  });

  describe('load', function() {
    beforeEach(function() {
      this.sound = new Sound(this.context, this.exampleSoundConfig);
    })

    it('returns a promise which fulfills once the sound is loaded', function(done) {
      const p = this.sound.load()
      expect(p).to.be.a(Promise)
      this.sound.state.loaded()
      p.then(() => {
        expect(this.sound.state.is('ready')).to.be(true)
        done()
      })
    })

    it('sets the state to loading', function() {
      this.sound.load()
      expect(this.sound.state.is('loading')).to.be(true)
    })
  })
});
