# webrtc-swarm

Create a swarm of p2p connections using webrtc and a signalhub

```
npm install webrtc-swarm
```

## Usage

``` js
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var wrtc = require('wrtc')

var hub = signalhub('http://yourdomain.com', 'swarm-example', {
  wrtc: wrtc // you don't need this if you use it in the browser
})

var sw = swarm(hub)

sw.on('peer', function (peer, id) {
  console.log('connected to a new peer:', id)
  console.log('total peers:', sw.peers.length)
})
```

## License

MIT
