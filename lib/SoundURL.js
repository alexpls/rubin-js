class SoundURL {
  constructor(url, type) {
    if (this.validTypes.indexOf(type) === -1) {
      throw new SyntaxError(`${type} is not a valid sound type`)
    }

    this.type = type
    this.url = url
  }

  get validTypes() {
    return ['mp3', 'wav', 'webm']
  }
}

module.exports = SoundURL
