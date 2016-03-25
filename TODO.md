// PRELOADING

// Should be able to add a bunch of audios to a preload pool, which will start
// loading the audio files in order and storing them in a cache. That way
// when the files are required to be played we should (hopefully) have them
// in a cache already.

var audioDescriptors = [{
    key: 'woof'
    urls: [
      {
        type: 'mp3',
        url: '/woof.mp3'
      },
      {
        type: 'webm',
        url: '/woof.webm'
      }
    ]
  },
  {
    key: 'howl',
    urls: [
      {
        type: 'wav',
        url: '/howl.wav'
      },
      {
        type: 'webm',
        url: '/howl.webm'
      }
    ]
  }
];

var descriptors = AudioLib.makeAudio(audioDescriptors);
var woof = descriptors[0];
var howl = descriptors[1];

AudioLib.preloadAudio(descriptors);

// Get progress of files loading in

AudioLib.on('preloadProgress', function(numCompleted, numTotal) {
  console.log(numCompleted + '/' + numTotal + ' done');
});

// Query whether specific files have been loaded in yet
AudioLib.loadSounds([woof, howl]).then(function() {
  nextQuestion();
});

// PLAYBACK

// create a track which sounds can be queued up on
// the track should also have a master volume, and expose audio apis
// that can be tacked on to it
var chordsTrack = AudioLib.createTrack('chords');
chordsTrack.volume = 0;
chordsTrack.volume = 1;

chordsTrack.pause();
chordsTrack.play();
chordsTrack.stop();
chordsTrack.seek(40);
chordsTrack.on('finished', function() {});

chordsTrack.addSounds([woof, howl], {
  crossFade: 1000 /* ms */
}).then(function() {
  chordsTrack.seek(0).play();
});

chordsTrack.fadeOut(200 /* ms */);
chordsTrack.clear();

chordsTrack.addSoundAt(positionInMS);
