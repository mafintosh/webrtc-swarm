var tape = require('tape')
var signalhub = require('signalhub')
var swarm = require('./')
var wrtc = require('electron-webrtc')()

tape('greet and close', function (t) {
  t.plan(5)

  var peer1 = swarm(signalhub('swarmtest', 'https://signalhub.mafintosh.com'), {wrtc})
  var peer2 = swarm(signalhub('swarmtest', 'https://signalhub.mafintosh.com'), {wrtc})

  var greeting = 'peer 1 says hello'
  var goodbye = 'peer 2 says goodbye'

  peer1.on('peer', function (peer, id) {
    t.ok(1, 'peer 1 joined by ' + id)
    peer.send(greeting)
    peer.on('data', function (c) {
      t.equal(c.toString(), goodbye, 'goodbye received')
      peer1.close(function () {
        t.ok(1, 'peer 1 closed')
        if (wrtc) wrtc.close()
      })
    })
  })

  peer2.on('peer', function (peer, id) {
    console.log('peer 2 joined by', id)
    peer.on('data', function (c) {
      t.equal(c.toString(), greeting, 'greeting received')
      peer.send(goodbye)
      peer2.close(function () {
        t.ok(1, 'peer 2 closed')
      })
    })
  })

  peer1.on('disconnect', function (peer, id) {
    t.comment('peer 1 disconnected from ' + id)
  })

  peer2.on('disconnect', function (peer, id) {
    t.comment('peer 2 disconnected from ' + id)
  })
})
