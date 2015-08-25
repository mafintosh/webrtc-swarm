var wrtc = require('wrtc')
var signalhub = require('signalhub')
var swarm = require('./')

var sw = swarm(signalhub('swarm-example', 'dev.mathiasbuus.eu:8080'), {
  wrtc: wrtc
})

sw.on('peer', function (peer, id) {
  console.log('new peer joined:', id)
  process.stdin.pipe(peer).pipe(process.stdout)
})
