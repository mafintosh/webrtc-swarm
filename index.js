var SimplePeer = require('simple-peer')
var events = require('events')
var through = require('through2')
var cuid = require('cuid')
var once = require('once')

module.exports = function (hub, opts) {
  if (!opts) opts = {}

  var swarm = new events.EventEmitter()
  var remotes = {}
  var me = cuid()

  swarm.maxPeers = opts.maxPeers || Infinity
  swarm.peers = []

  var setup = function (peer, id) {
    peer.on('connect', function () {
      swarm.peers.push(peer)
      swarm.emit('peer', peer, id)
      swarm.emit('connection', peer, id)
    })

    var onclose = once(function () {
      if (remotes[id] === peer) delete remotes[id]
      var i = swarm.peers.indexOf(peer)
      if (i > -1) swarm.peers.splice(i, 1)
    })

    var signals = []
    var sending = false

    var kick = function () {
      if (sending || !signals.length) return
      sending = true
      hub.broadcast(id, {from: me, signal: signals.shift()}, function () {
        sending = false
        kick()
      })
    }

    peer.on('signal', function (sig) {
      signals.push(sig)
      kick()
    })

    peer.on('error', onclose)
    peer.once('close', onclose)
  }

  hub.subscribe('all').pipe(through.obj(function (data, enc, cb) {
    if (data.from === me) return cb()

    if (data.type === 'connect') {
      if (swarm.peers.length >= swarm.maxPeers) return cb()
      if (remotes[data.from]) return cb()

      var peer = new SimplePeer({
        wrtc: opts.wrtc,
        initiator: true
      })

      setup(peer, data.from)
      remotes[data.from] = peer
    }

    cb()
  }))

  var connect = function () {
    if (swarm.peers.length >= swarm.maxPeers) return
    hub.broadcast('all', {type: 'connect', from: me}, function () {
      setTimeout(connect, swarm.peers.length ? 15000 : 5000)
    })
  }

  hub.subscribe(me).once('open', connect).pipe(through.obj(function (data, enc, cb) {
    var peer = remotes[data.from]

    if (!peer) {
      if (!data.signal || data.signal.type !== 'offer') return cb()

      peer = remotes[data.from] = new SimplePeer({
        wrtc: opts.wrtc
      })

      setup(peer, data.from)
    }

    peer.signal(data.signal)
    cb()
  }))

  return swarm
}
