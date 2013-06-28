var automata = require('./')
var zeros = require('zeros')

var buffer = zeros([120, 40])
  , width = buffer.shape[0]
  , height = buffer.shape[1]
  , iterate = automata(buffer, {
    density: 0.5
  })

for (var i = 0; i < 10; i += 1) setTimeout(function() {
  for (var y = 1; y < height-1; y += 1) {
    for (var x = 1; x < width-1; x += 1) {
      process.stdout.write((buffer.get(x, y)) ? '@' : '.')
    }
    process.stdout.write('\n')
  }
  iterate()
  console.log()
}, i * 500)
