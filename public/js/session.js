const session = {
    getSessionId: () => {
        return localStorage.getItem('sessionId');
    },
    setSessionId: (sessionId) => {
        localStorage.setItem('sessionId', sessionId);
    },
    clearSessionId: () => {
        localStorage.removeItem('sessionId');
    }
};