const { PeerServer } = require('peer');
const peerServer = PeerServer({
    port: 9000,
    path: '/myapp' // Этот путь важен!
});
console.log('🚀 PeerJS сервер запущен');
```[citation:12]
Именно этот путь (`/myapp`) вы указываете в своём HTML-коде. Если он отличается, соединения не будет [citation:12].
