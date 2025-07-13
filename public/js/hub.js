const socket = io();
const qrCodeElement = document.getElementById('qr-code');
const sessionIdElement = document.getElementById('session-id');
const statusElement = document.getElementById('status');

let sessionId = session.getSessionId();

if (sessionId) {
    socket.emit('join-session', sessionId);
} else {
    socket.emit('create-session');
}

socket.on('session-created', (newSessionId) => {
    sessionId = newSessionId;
    session.setSessionId(sessionId);
    sessionIdElement.textContent = `Session ID: ${sessionId}`;
    new QRCode(qrCodeElement, {
        text: `${window.location.origin}/sensor.html?sessionId=${sessionId}`,
        width: 128,
        height: 128,
    });
});

socket.on('controller-joined', (controllerId) => {
    statusElement.textContent = `Controller ${controllerId} connected.`;
});

socket.on('controller-left', (controllerId) => {
    statusElement.textContent = `Controller ${controllerId} disconnected.`;
});

function selectGame(gameUrl) {
    window.location.href = `${window.location.origin}/games/${gameUrl}`;
}
