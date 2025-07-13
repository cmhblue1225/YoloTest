const socket = io();
const statusElement = document.getElementById('status');

const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId');

if (sessionId) {
    socket.emit('join-controller', sessionId);
} else {
    statusElement.textContent = 'No session ID found.';
}

socket.on('session-accepted', (sessionId) => {
    statusElement.textContent = `Connected to session ${sessionId}`;
    window.addEventListener('devicemotion', (e) => {
        const sensorData = {
            sessionId: sessionId,
            acceleration: {
                x: e.acceleration.x,
                y: e.acceleration.y,
                z: e.acceleration.z
            },
            rotationRate: {
                alpha: e.rotationRate.alpha,
                beta: e.rotationRate.beta,
                gamma: e.rotationRate.gamma
            },
            timestamp: Date.now()
        };
        socket.emit('sensor-data', sensorData);
    });
});

socket.on('session-error', (errorMessage) => {
    statusElement.textContent = `Error: ${errorMessage}`;
});
