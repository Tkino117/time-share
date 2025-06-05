import { SessionManager } from "../../src/service/sessionManager";

describe('SessionManager', () => {
    const sessionManager = new SessionManager();
    const userId = 'test-user-1';
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 1000 * 60 * 60 * 24);

    beforeEach(async () => {
        sessionManager.clearAllSessions();
    });

    afterEach(async () => {
        sessionManager.clearAllSessions();
    });

    it('createSession', async () => {
        const session = sessionManager.createSession(userId, startTime, endTime);
        expect(session).toBeDefined();
        expect(session.userId).toBe(userId);
        expect(session.startTime).toBe(startTime);
        expect(session.endTime).toBe(endTime);
    });

    it('getSession', async () => {
        const session = sessionManager.createSession(userId, startTime, endTime);
        const retrievedSession = sessionManager.getSession(session.sessionId);
        expect(retrievedSession).toBeDefined();
        expect(retrievedSession?.userId).toBe(userId);
        expect(retrievedSession?.startTime).toBe(startTime);
        expect(retrievedSession?.endTime).toBe(endTime); 
    });

    
});