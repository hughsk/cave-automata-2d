var automata = require('./')
var ndarray = require('ndarray')

var buffer = ndarray.zeros([50, 50])
  , width = buffer.shape[0]
  , height = buffer.shape[1]
  , iterate = automata(buffer)

for (var i = 0; i < 15; i += 1) setTimeout(function() {
  for (var y = 0; y < height; y += 1) {
    for (var x = 0; x < width; x += 1) {
      process.stdout.write((buffer.get(x, y)) ? '@' : ' ')
    }
    process.stdout.write('\n')
  }
  iterate()
}, i * 500)
