var wrtc = require('wrtc')
var signalhub = require('signalhub')
var swarm = require('./')

var sw = swarm(signalhub('dev.mathiasbuus.eu:8080', 'swarm-example'), {
  wrtc: wrtc
})

sw.on('peer', function (peer, id) {
  console.log('new peer joined:', id)
  process.stdin.pipe(peer).pipe(process.stdout)
})