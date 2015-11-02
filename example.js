var signalhub = require('signalhub')
var swarm = require('./')

var sw = swarm(signalhub('swarmtest', 'https://signalhub.mafintosh.com'))

sw.on('peer', function (peer, id) {
  console.log('new peer joined:', id)
  peer.on('data', function (c) {
    console.log('got data', c)
  })
  peer.write('hello')
})

sw.on('disconnect', function (peer, id) {
  console.log('DISCONNECT', id)
})
