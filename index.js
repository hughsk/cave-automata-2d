var neighborhood = require('moore')(1, 2).concat([[0,0]])
var stencil = require('ndarray-stencil')
var fill = require('ndarray-fill')
var zero = require('zeros')

var neighbors = neighborhood.length

module.exports = generate
function generate(array, opts) {
  opts = opts || {}

  var width = array.shape[0]
    , height = array.shape[1]
    , buffer = zero([ width, height ])

  var density = opts.density || 0.5
    , threshold = opts.threshold || 5
    , border = 'border' in opts ? opts.border : 1
    , hood = opts.hood || 1
    , shouldFill = 'fill' in opts ? opts.fill : true

  if (shouldFill) fill(array, function(x, y) {
    return Math.random() <= density || (
      x <= 1 || x >= width-2 ||
      y <= 1 || y >= height-2
    ) ? 1 : 0
  })

  var iterate = border ? stencil(neighborhood, function(p1,p2,p3,p4,p5,p6,p7,p8,p9,pos) {
    return (
      p1+p2+p3+p4+p5+p6+p7+p8+p9 >= threshold ||
      pos[0] < border ||
      pos[0] > width - border - 3 ||
      pos[1] < border ||
      pos[1] > height - border - 3
    ) ? 1 : 0
  }) : stencil(neighborhood, function(p1,p2,p3,p4,p5,p6,p7,p8,p9,pos) {
    return (
      p1+p2+p3+p4+p5+p6+p7+p8+p9 >= threshold
    ) ? 1 : 0
  })

  if (opts.iterations) {
    iterator(opts.iterations)
  }

  return iterator

  function iterator(iterations) {
    iterations = iterations || 1

    for (var i = 0; i < iterations; i += 1) {
      if (i % 2) {
        iterate(array, buffer)
      } else {
        iterate(buffer, array)
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
