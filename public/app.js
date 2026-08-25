const socket = io(); // Подключаемся к текущему домену
const roomId = 'my-room'; // Пока просто комната, потом можно сделать по ссылке

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

let localStream;
let peerConnection;
let isMicOn = true;
let isCamOn = true;

const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Функция для перехода на экран звонка
function startCall() {
    document.getElementById('call-screen').style.display = 'block';
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;
            socket.emit('join-room', roomId);
        })
        .catch(err => alert('Не удалось получить доступ к камере: ' + err));
}

socket.on('user-connected', async () => {
    peerConnection = createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer, roomId);
});

socket.on('offer', async (offer) => {
    peerConnection = createPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer, roomId);
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', async (candidate) => {
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
});

function createPeerConnection() {
    const pc = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, roomId);
        }
    };

    pc.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    return pc;
}

// Кнопки управления
function toggleMic() {
    isMicOn = !isMicOn;
    localStream.getAudioTracks().forEach(track => track.enabled = isMicOn);
}
function toggleCam() {
    isCamOn = !isCamOn;
    localStream.getVideoTracks().forEach(track => track.enabled = isCamOn);
}
function hangUp() {
    if (peerConnection) peerConnection.close();
    socket.disconnect();
    window.location.reload();
                                         }
