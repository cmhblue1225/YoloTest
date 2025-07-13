# 📱 Sensor-Based Web Game Hub - Full System Specification

## 🧩 Project Overview

# 📱 Sensor-Based Web Game Hub - Full System Specification

## 🧩 Project Overview

This project is a **web-based real-time sensor game hub**. It allows users to:

- Use their **smartphone sensors** (gyroscope, accelerometer, compass) to control web-based games.
- View and play games on **PC**, while controlling them via a **mobile phone as a controller**.
- Create and maintain a **persistent session** between PC and mobile.
- Support **Solo Play**, **Multiplayer**, and **Dual Sensor** modes.
- **Return to Hub**, switch games, and resume with the **same session** without reconnection.

---

## 🧱 Tech Stack

- **Frontend (Web UI)**:  
  - PC Side: HTML, CSS, JavaScript (Canvas/WebGL/Game Engine optional)  
  - Mobile Side: JavaScript + DeviceMotion / Generic Sensor API  

- **Backend (Realtime Communication)**:  
  - Node.js + Express  
  - WebSocket (Socket.IO)

- **QR Code Generator**: qrcode.js or third-party library

---

## 📂 Folder Structure
sensor-game-hub/
├── server/                     # Node.js Socket.IO backend
│   └── index.js                # Main WebSocket server
│
├── public/
│   ├── hub.html                # Game hub (PC)
│   ├── sensor.html             # Mobile sensor controller
│   ├── games/
│   │   ├── game1.html          # Game A (Solo)
│   │   ├── game2.html          # Game B (Multiplayer)
│   │   └── game3.html          # Game C (Dual Sensor)
│   └── js/
│       ├── hub.js              # Hub logic (PC)
│       ├── sensor.js           # Sensor capture and transmit (Mobile)
│       ├── session.js          # Shared session manager
│       └── socket-client.js    # Socket.IO setup
│
├── package.json
└── README.md

---

## 🔐 Session Logic (Persistent & Reusable)

### Session Lifecycle

1. **Hub (PC)** loads and requests a `sessionId` from server.
2. Server generates and registers a `sessionId`, returns it to PC.
3. PC displays a **QR code** or **shareable link** containing `sessionId`.
4. **Sensor Client (Mobile)** joins by scanning QR or using URL.
5. Server binds that mobile client to the session.
6. PC receives sensor data from the mobile in real-time.

### Session Data (on server memory)

```js
{
  sessionId: {
    pcSocketId: "...",
    controllers: [
      { mobileSocketId: "...", deviceType: "gyro" }
    ],
    lastActive: timestamp,
    mode: "solo" | "multi" | "dual"
  }
}
Persistent Across Pages
	•	Session persists across game switches
	•	Clients must re-join with sessionId on each page load
	•	session.js module handles session transfer via:
	•	localStorage
	•	sessionStorage
	•	URL parameter fallback

🔁 Game Mode Logic

🕹️ Solo Mode
	•	One PC, one mobile sensor
	•	Standard flow

🧑‍🤝‍🧑 Multiplayer Mode
	•	One PC, multiple mobile clients
	•	Server broadcasts each mobile’s data to game logic

🧭 Dual Sensor Mode
	•	One user controls two phones
	•	Each phone sends distinct data (e.g., left/right hand control)

⸻

🔌 WebSocket Events

[PC → Server]
	•	create-session: 요청 시 세션 생성
	•	join-session: 세션 참여 요청 (검증 포함)
	•	request-session-status: 현재 연결 정보 조회

[Mobile → Server]
	•	join-controller: 센서 클라이언트가 세션 참여
	•	sensor-data: 실시간 센서 데이터 전송

[Server → PC]
	•	controller-joined: 새로운 센서 클라이언트 등록됨
	•	sensor-update: 센서 데이터 중계

[Server → Mobile]
	•	session-accepted or session-error

⸻

🛰️ Sensor Client (Mobile) - Implementation Plan
window.addEventListener("devicemotion", (e) => {
  socket.emit("sensor-data", {
    sessionId: sessionId,
    acceleration: e.acceleration,
    rotationRate: e.rotationRate,
    timestamp: Date.now()
  });
});
	•	Sensor data is throttled/debounced
	•	Configurable sensitivity/axis filters

⸻

🖥️ Hub & Game (PC) - Sensor Binding
socket.on("sensor-update", (data) => {
  // Apply data to game control logic
  updatePlayerRotation(data.rotationRate.alpha);
});
🧠 Smart UX / Fail-safety Features
	•	Session recovery if user refreshes or closes/reopens tab
	•	QR code regeneration with session URL
	•	Real-time status banner: "Connected to 2 Controllers"
	•	Disconnect and reconnect handlers
	•	Optional auth name/label per client

⸻

🚨 Edge Case Handling
Case
Handling
모바일 중도 연결 해제
서버가 disconnect 감지 → PC에 알림
같은 sessionId에 중복 접속
서버가 중복 여부 체크 후 거부 or 교체
허브 복귀 후 게임 전환
sessionId 유지 → 자동 연결 재시도
센서 없는 기기에서 접속 시
감지 후 "센서를 지원하지 않는 기기입니다" 경고

🔧 Build Instructions
# 1. Install dependencies
npm install

# 2. Run WebSocket + HTTP server
node server/index.js

# 3. Open PC: http://localhost:3000/hub.html
# 4. Scan QR with Mobile: http://localhost:3000/sensor.html?sessionId=xxxx

✅ Implementation Milestones
	•	server/index.js - SessionManager, WebSocket routing
	•	sensor.html + sensor.js - Mobile controller
	•	hub.html + hub.js - Hub UI & session creation
	•	games/game1.html - Simple test game with control
	•	session.js - Session transfer across pages
	•	QR Code generator (bonus)
	•	Reconnect/resume logic (bonus)
	•	Dual sensor support (advanced)

⸻

