var signalhub = require('signalhub')
var swarm = require('./')

var sw = swarm(signalhub('swarmtest', 'https://signalhub.mafintosh.com'))

sw.on('peer', function (peer, id) {
  console.log('new peer joined:', id)
  process.stdin.pipe(peer).pipe(process.stdout)
})
