global.expect = require('expect.js');

// Since we don't have browser APIs available when we run our tests let's just
// stub out what we need to access
global.window = global.window || {}

global.window.AudioContext = require('./stubs/AudioContextStub')
