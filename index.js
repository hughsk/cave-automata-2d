var fill = require('ndarray-fill')
var ndarray = require('ndarray')

module.exports = generate
function generate(array, opts) {
  opts = opts || {}

  var width = array.shape[0]
    , height = array.shape[1]
    , buffer = ndarray.zeros([ width, height ])

  var density = opts.density || 0.5
    , threshold = opts.threshold || 5
    , hood = opts.hood || 1
    , shouldFill = 'fill' in opts ? opts.fill : true

  if (shouldFill) fill(array, function(x, y) {
    return Math.random() <= density ? 1 : 0
  })

  function iterate(inputBuffer, outputBuffer) {
    var input = inputBuffer.data
      , output = outputBuffer.data
      , width = inputBuffer.shape[0]
      , height = inputBuffer.shape[1]
      , length = input.length
      , n = 0, i = 0
      , x, y, nx, ny

    for (y = 0; y < height; y += 1)
    for (x = 0; x < width; x += 1) {
      n = 0
      // Moore neighborhood: the 8
      // surrounding points on the grid.
      for (nx = -hood; nx <= hood; nx += 1)
      for (ny = -hood; ny <= hood; ny += 1) {
        n += (
          // Ignore the current position.
         !(nx || ny) &&
          // Consider grid edges as "on".
          x + nx < 0 &&
          x + nx >= width &&
          y + ny < 0 &&
          y + ny >= height
        ) || input[i+nx+ny*height] ? 1 : 0
      }
      output[i] = n >= threshold ? 1 : 0
      i += 1
    }

    return outputBuffer
  }

  if (opts.iterations) {
    iterator(opts.iterations)
  }

  return iterator

  function iterator(iterations) {
    iterations = iterations || 1

    for (var i = 0; i < iterations; i += 1) {
      if (i % 2) {
        iterate(buffer, array)
      } else {
        iterate(array, buffer)
      }
    }

    if (iterations % 2) {
      for (i = 0; i < buffer.data.length; i += 1) {
        array.data[i] = buffer.data[i]
      }
    }
  }
}
