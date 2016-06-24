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

Valid keys for `opts` include

- `wrtc` - (optional) a reference to the `wrtc` library, if using Node.
- `uuid` - (optional) a unique identifier for this peer. One is generated for you
if not supplied.
- `maxPeers` - (optional) the maximum number of peers you wish to connect to.
Defaults to unlimited.

### sw.close()

Disconnect from swarm

### sw.on('peer|connect', peer, id)

`peer` and `connect` are interchangeable. Fires when a connection has been
established to a new peer `peer`, with unique id `id`.

### sw.on('disconnect', peer, id)

Fires when an existing peer connection is lost.

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
