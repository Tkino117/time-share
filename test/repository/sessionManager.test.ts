import { SessionManager } from "../../src/repository/SessionManager";

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

    it('deleteSession', async () => {
        const session = sessionManager.createSession(userId, startTime, endTime);
        sessionManager.deleteSession(session.sessionId);
        const retrievedSession = sessionManager.getSession(session.sessionId);
        expect(retrievedSession).toBeUndefined();
    });

    it(`clearAllSessions`, async () => {
        const session = sessionManager.createSession(userId, startTime, endTime);
        sessionManager.clearAllSessions();
        const retrievedSession = sessionManager.getSession(session.sessionId);
        expect(retrievedSession).toBeUndefined();
    });

    it(`deleteExpiredSessions`, async () => {
        const session = sessionManager.createSession(userId, startTime);
        sessionManager.deleteExpiredSessions();
        const allSessions = sessionManager.findAllSessions();
        expect(allSessions).toHaveLength(1);
        expect(allSessions[0].sessionId).toBe(session.sessionId);
        expect(allSessions[0].userId).toBe(userId);
        expect(allSessions[0].startTime).toBe(startTime);
        expect(allSessions[0].endTime).toEqual(endTime);
        const session2 = sessionManager.createSession(userId, startTime, new Date(startTime.getTime() + 500));
        await new Promise(resolve => setTimeout(resolve, 600));
        sessionManager.deleteExpiredSessions();
        const allSessions2 = sessionManager.findAllSessions();
        expect(allSessions2).toHaveLength(1);
        expect(allSessions2[0].sessionId).toBe(session.sessionId);
    });
    
});