var tape = require('tape')
var signalhub = require('signalhub')
var swarm = require('./')
var wrtc = require('electron-webrtc')()
var crypto = require('crypto')

tape('two peers exchange data and close', function (t) {
  t.plan(6)

  var key = randomHex('64')

  var peer1 = swarm(signalhub(key, 'https://signalhub.mafintosh.com'), {wrtc})
  var peer2 = swarm(signalhub(key, 'https://signalhub.mafintosh.com'), {wrtc})

  var greeting = 'peer 1 says hello'
  var goodbye = 'peer 2 says goodbye'

  peer1.on('peer', function (peer, id) {
    t.ok(1, 'peer 1 joined by ' + id)
    peer.send(greeting)
    peer.on('data', function (c) {
      t.equal(c.toString(), goodbye, 'goodbye received')
      peer1.close(function () {
        t.ok(1, 'peer 1 closed')
      })
    })
  })

  peer2.on('peer', function (peer, id) {
    t.ok(1, 'peer 2 joined by', id)
    peer.on('data', function (c) {
      t.equal(c.toString(), greeting, 'greeting received')
      peer.send(goodbye)
      peer2.close(function () {
        t.ok(1, 'peer 2 closed')
      })
    })
  })
})

tape('three peers connect and close', function (t) {
  t.plan(10)

  var key = randomHex('64')

  var counts = 0
  var peers = Array(3).fill(0).map(function () { return swarm(signalhub(key, 'https://signalhub.mafintosh.com'), {wrtc}) })

  peers.forEach(function (peer, i) {
    peer.on('peer', function () {
      t.ok(1, ++counts + ' connections')
      if (counts === 6) {
        t.ok(1, 'everyone connected')
        peers.forEach(function (peer, i) {
          peer.close(function () {
            t.ok(1, 'peer ' + i + ' closed')
          })
        })
        if (wrtc) wrtc.close()
      }
    })
  })
})

function randomHex (len) {
  return crypto.randomBytes(Math.ceil(len / 2))
         .toString('hex') // convert to hexadecimal format
         .slice(0, len)   // return required number of characters
}
