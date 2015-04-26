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

    peer.on('error', onclose)
    peer.once('close', onclose)
  }

  hub.subscribe('all').pipe(through.obj(function (data, enc, cb) {
    if (data.from === me) return cb()

    if (data.type === 'connect') {
      if (remotes[data.from]) return cb()

      var peer = new SimplePeer({
        wrtc: opts.wrtc,
        initiator: true
      })

      peer.on('signal', function (sig) {
        hub.broadcast(data.from, {from: me, signal: sig})
      })

      setup(peer, data.from)
      remotes[data.from] = peer
    }

    cb()
  }))

  var connect = function () {
    hub.broadcast('all', {type: 'connect', from: me})
  }

  hub.subscribe(me).once('open', connect).pipe(through.obj(function (data, enc, cb) {
    var peer = remotes[data.from]

    if (!peer) {
      peer = remotes[data.from] = new SimplePeer({
        wrtc: opts.wrtc
      })

      peer.on('signal', function (sig) {
        hub.broadcast(data.from, {from: me, signal: sig})
      })

      setup(peer, data.from)
    }

    peer.signal(data.signal)
    cb()
  }))

  return swarm
}
