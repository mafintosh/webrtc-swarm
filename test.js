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
    t.plan(6)

    var hub1 = signalhub('app', 'localhost:9000')
    var hub2 = signalhub('app', 'localhost:9000')

    var sw1 = swarm(hub1, {wrtc})
    var sw2 = swarm(hub2, {wrtc})

    var greeting = 'hello'
    var goodbye = 'goodbye'

    sw1.on('peer', function (peer, id) {
      t.pass('peer from sw2 joined')
      peer.send(greeting)
      peer.on('data', function (data) {
        t.equal(data.toString(), goodbye, 'goodbye received')
        sw1.close(function () {
          t.pass('sw1 closed')
        })
      })
    })

    sw2.on('peer', function (peer, id) {
      t.pass('peer from sw1 joined')
      peer.on('data', function (data) {
        t.equal(data.toString(), greeting, 'greeting received')
        peer.send(goodbye)
        sw2.close(function () {
          t.pass('sw2 closed')
        })
      })
    })
  })
})
