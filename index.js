var SimplePeer = require('simple-peer')
var events = require('events')
var through = require('through2')
var cuid = require('cuid')
var once = require('once')
var debug = require('debug')('webrtc-swarm')

module.exports = function (hub, opts) {
  if (!opts) opts = {}

  var swarm = new events.EventEmitter()
  var remotes = {}
  var me = cuid()
  debug('my uuid:', me)

  swarm.maxPeers = opts.maxPeers || Infinity
  swarm.peers = []

  var setup = function (peer, id) {
    peer.on('connect', function () {
      debug('connected to peer', id)
      swarm.peers.push(peer)
      swarm.emit('peer', peer, id)
      swarm.emit('connect', peer, id)
    })

    var onclose = once(function (err) {
      debug('disconnected from peer', id, err)
      if (remotes[id] === peer) delete remotes[id]
      var i = swarm.peers.indexOf(peer)
      if (i > -1) swarm.peers.splice(i, 1)
      swarm.emit('disconnect', peer, id)
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
    debug('/all', data)
    if (data.from === me) {
      debug('skipping self', data.from)
      return cb()
    }

    if (data.type === 'connect') {
      if (swarm.peers.length >= swarm.maxPeers) {
        debug('skipping because maxPeers is met', data.from)
        return cb()
      }
      if (remotes[data.from]) {
        debug('skipping existing remote', data.from)
        return cb()
      }

      debug('connecting to new peer (as initiator)', data.from )
      var peer = new SimplePeer({
        wrtc: opts.wrtc,
        initiator: true,
        config: opts.config
      })

      setup(peer, data.from)
      remotes[data.from] = peer
    }

    cb()
  }))

  var connect = function () {
    if (swarm.peers.length >= swarm.maxPeers) return
    hub.broadcast('all', {type: 'connect', from: me}, function () {
      setTimeout(connect, Math.floor(Math.random() * 2000) + (swarm.peers.length ? 13000 : 3000))
    })
  }

  hub.subscribe(me).once('open', connect).pipe(through.obj(function (data, enc, cb) {
    var peer = remotes[data.from]
    if (!peer) {
      if (!data.signal || data.signal.type !== 'offer') {
        debug('skipping non-offer', data)
        return cb()
      }

      debug('connecting to new peer (as not initiator)', data.from)
      peer = remotes[data.from] = new SimplePeer({
        wrtc: opts.wrtc,
        config: opts.config
      })

      setup(peer, data.from)
    }

    debug('signalling', data.from, data.signal)
    peer.signal(data.signal)
    cb()
  }))

  return swarm
}
