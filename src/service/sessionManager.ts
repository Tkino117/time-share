import { v4 as uuidv4 } from 'uuid';

export interface Session {
    userId: string;
    sessionId: string;
    startTime: Date;
    endTime: Date;
}

export class SessionManager {
    private sessions: Map<string, Session> = new Map();
    private defaultTimeout: number = 1000 * 60 * 60 * 24;
    public createSession(userId: string, startTime: Date, endTime: Date | null = null): Session {
        if (endTime === null) {
            endTime = new Date(startTime.getTime() + this.defaultTimeout);
        }
        const session: Session = {
            userId,
            sessionId: uuidv4(),
            startTime,
            endTime,
        };
        this.sessions.set(session.sessionId, session);
        return session;
    }

    public getSession(sessionId: string): Session | undefined {
        const session = this.sessions.get(sessionId);
        if (session === undefined) {
            return undefined;
        }
        if (session.endTime < new Date()) {
            this.sessions.delete(sessionId);
            return undefined;
        }
        return session;
    }

    public deleteSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    public clearAllSessions(): void {
        this.sessions.clear();
    }

    public deleteExpiredSessions(): void {
        const now = new Date();
        for (const session of this.sessions.values()) {
            if (session.endTime < now) {
                this.sessions.delete(session.sessionId);
            }
        }
    }

    public findAllSessions(): Session[] {
        return Array.from(this.sessions.values());
    }
}
