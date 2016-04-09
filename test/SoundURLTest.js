import SoundURL from '../src/SoundURL';

describe('SoundURL', function() {
  describe('instantiation', () => {
    it('can be instantiated', () => {
      var a = new SoundURL('hey.mp3', 'mp3');
      expect(a).to.be.a(SoundURL);
    })

    it('only accepts valid audio types', function() {
      function throws(type) { return () => { new SoundURL('hey.blurgh', type) } }
      expect(throws('blurgh')).to.throwException(/not a valid sound type/);
      expect(throws('mp3')).to.not.throwException();
      expect(throws('wav')).to.not.throwException();
      expect(throws('webm')).to.not.throwException();
    })
  })
})
