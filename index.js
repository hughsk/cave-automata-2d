var fill = require('ndarray-fill')
var ndarray = require('ndarray')
var neighborhood = require('moore')(1, 2).concat([[0,0]])
var neighbors = neighborhood.length

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
    return Math.random() <= density || (
      x <= 0 || x >= width-1 ||
      y <= 0 || y >= height-1
    ) ? 1 : 0
  })

  function iterate(inputBuffer, outputBuffer) {
    var input = inputBuffer.data
      , output = outputBuffer.data
      , width = inputBuffer.shape[1]
      , height = inputBuffer.shape[0]
      , length = input.length
      , n = 0, i = 0, m = 0
      , x, y, nx, ny

    for (x = 0; x < width; x += 1)
    for (y = 0; y < height; y += 1) {
      n = 0

      for (m = 0; m < neighbors; m += 1) {
        nx = neighborhood[m][0]
        ny = neighborhood[m][1]

        n += input[i+ny*width+nx] || (
          x + nx < 0 ||
          x + nx >= width ||
          y + ny < 0 ||
          y + ny >= height
        ) ? 1 : 0
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

    return array
  }
}
