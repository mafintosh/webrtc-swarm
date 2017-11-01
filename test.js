var server = require('signalhub/server')()
var signalhub = require('signalhub')
var swarm = require('./')
var test = require('tape')
var wrtc = require('electron-webrtc')()

test.onFinish(function () {
  server.close()
  wrtc.close()
})

server.listen(9000, function () {
  test('greet and close', function (t) {
    t.plan(8)

    var hub1 = signalhub('app', 'localhost:9000')
    var hub2 = signalhub('app', 'localhost:9000')

    var sw1 = swarm(hub1, {wrtc})
    var sw2 = swarm(hub2, {wrtc})

    var hello = 'hello'
    var goodbye = 'goodbye'

    var peerIds = {}

    sw1.on('peer', function (peer, id) {
      t.pass('connected to peer from sw2')
      peerIds.sw2 = id
      peer.send(hello)
      peer.on('data', function (data) {
        t.equal(data.toString(), goodbye, 'goodbye received')
        sw1.close(function () {
          t.pass('swarm sw1 closed')
        })
      })
    })

    sw2.on('peer', function (peer, id) {
      t.pass('connected to peer from sw1')
      peerIds.sw1 = id
      peer.on('data', function (data) {
        t.equal(data.toString(), hello, 'hello received')
        peer.send(goodbye)
        sw2.close(function () {
          t.pass('swarm sw2 closed')
        })
      })
    })

    sw1.on('disconnect', function (peer, id) {
      if (id === peerIds.sw2) {
        t.pass('connection to peer from sw2 lost')
      }
    })

    sw2.on('disconnect', function (peer, id) {
      if (id === peerIds.sw1) {
        t.pass('connection to peer from sw1 lost')
      }
    })
  })
})
