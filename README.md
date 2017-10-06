# webrtc-swarm

> Create a swarm of p2p connections using webrtc and a
[signalhub](https://github.com/mafintosh/signalhub).

```
npm install webrtc-swarm
```

## Usage

``` js
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')

var hub = signalhub('swarm-example', ['http://yourdomain.com'])

var sw = swarm(hub, {
  wrtc: require('wrtc') // don't need this if used in the browser
})

sw.on('peer', function (peer, id) {
  console.log('connected to a new peer:', id)
  console.log('total peers:', sw.peers.length)
})

sw.on('disconnect', function (peer, id) {
  console.log('disconnected from a peer:', id)
  console.log('total peers:', sw.peers.length)
})
```

## API

```js
var swarm = require('webrtc-swarm')
```

### var sw = swarm(hub, opts)

Creates a new webrtc swarm using
[signalhub](https://github.com/mafintosh/signalhub) `hub` for discovery and
connection brokering.

Valid keys for `opts` include:

- `wrtc` - (optional) a reference to the `wrtc` library, if using Node.
- `uuid` - (optional) a unique identifier for this peer. One is generated for
you if not supplied.
- `maxPeers` - (optional) the maximum number of peers you wish to connect to.
Defaults to unlimited.
- `wrap` - (optional) a function that can modify the WebRTC signaling data
before it gets send out. It's called  with `wrap(outgoingSignalingData,
destinationSignalhubChannel)` and must return the wrapped signaling data.
- `unwrap` - (optional) a function that can modify the WebRTC signaling data
before it gets processed. It's called  with `unwrap(incomingData,
sourceSignalhubChannel)` and must return the raw signaling data.

Additional optional keys can be passed through to the underlying
[simple-peer](https://www.npmjs.com/package/simple-peer) instances:

- `channelConfig` -  custom webrtc data channel configuration (used by
`createDataChannel`)
- `config` - custom webrtc configuration (used by `RTCPeerConnection`
constructor)
- `stream` - if video/voice is desired, pass stream returned from
`getUserMedia`


### sw.close()

Disconnect from swarm

### sw.on('peer|connect', peer, id)

`peer` and `connect` are interchangeable. Fires when a connection has been
established to a new peer `peer`, with unique id `id`.

### sw.on('disconnect', peer, id)

Fires when an existing peer connection is lost.

`peer` is a [simple-peer](https://www.npmjs.com/package/simple-peer) instance.

### sw.on('close')

Fires when all peer and signalhub connections are closed

### sw.peers

A list of peers that `sw` is currently connected to.

### swarm.WEBRTC_SUPPORT

Detect native WebRTC support in the javascript environment.

```js
var swarm = require('webrtc-swarm')

if (swarm.WEBRTC_SUPPORT) {
  // webrtc support!
} else {
  // fallback
}
```

## License

MIT
