var neighborhood = require('moore')(1, 2).concat([[0,0]])
var stencil = require('ndarray-stencil')
var fill = require('ndarray-fill')
var zero = require('zeros')

var neighbors = neighborhood.length
var stencils = {}

module.exports = generate

// ndarray-stencil generates code using cwise, and as
// such incurs a slight performance hit initially.
// To work around this, we can keep two cached functions
// which use shared parameters. See `iterator` for more info.
var sharedWidth = null
var sharedHeight = null
var sharedBorder = null
var sharedThreshold = null

stencils.vanilla = stencil(neighborhood, function(p1,p2,p3,p4,p5,p6,p7,p8,p9,pos) {
  return (
    p1+p2+p3+p4+p5+p6+p7+p8+p9 >= sharedThreshold
  ) ? 1 : 0
}, { useIndex: false })

stencils.border = stencil(neighborhood, function(p1,p2,p3,p4,p5,p6,p7,p8,p9,pos) {
  return (
    p1+p2+p3+p4+p5+p6+p7+p8+p9 >= sharedThreshold ||
    pos[0] < sharedBorder ||
    pos[0] > sharedWidth - sharedBorder - 3 ||
    pos[1] < sharedBorder ||
    pos[1] > sharedHeight - sharedBorder - 3
  ) ? 1 : 0
}, { useIndex: true })

function generate(array, opts) {
  opts = opts || {}

  var width = array.shape[0]
    , height = array.shape[1]
    , buffer = opts.buffer || zero([ width, height ])

  var density = opts.density || 0.5
    , threshold = opts.threshold || 5
    , border = 'border' in opts ? opts.border : 1
    , shouldFill = 'fill' in opts ? opts.fill : true
    , iterate = stencils[
      border ? 'border' : 'vanilla'
    ]

  if (shouldFill) fill(array, function(x, y) {
    return Math.random() <= density || (
      x <= 1 || x >= width-2 ||
      y <= 1 || y >= height-2
    ) ? 1 : 0
  })

  if (opts.iterations) {
    iterator(opts.iterations)
  }

  return iterator

  // Updates the shared variables that are available
  // on the module-level scope. This is a synchronous
  // operation, so it's totally safe (though not
  // necessarily pretty) provided these values are
  // updated before any iteration.
  function iterator(iterations) {
    sharedWidth = width
    sharedHeight = height
    sharedBorder = border
    sharedThreshold = threshold

    iterations = iterations || 1

    for (var i = 0; i < iterations; i += 1) {
      if (i % 2) {
        iterate(array, buffer)
      } else {
        iterate(buffer, array)
      }
    }

    if (iterations % 2) {
      fill(array, function(x, y) {
        return buffer.get(x, y)
      })
    }

    return array
  }
}
