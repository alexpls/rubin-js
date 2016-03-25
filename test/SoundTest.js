import Sound from '../lib/Sound'

describe('Sound', () => {
  describe('instantiation', () => {
    it('instantiates with an options object', () => {
      const sound = new Sound({
        key: 'woof',
        urls: [
          { type: 'wav', url: './woof.wav' }
        ]
      });

      expect(sound).to.be.a(Sound);
    });
  });
});
