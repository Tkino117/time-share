export class EventNotFoundError extends Error {
    constructor(eventId: number) {
        super(`Event not found: ${eventId}`);
        this.name = 'EventNotFoundError';
    }
}

export class InvalidEventIdError extends Error {
    constructor(eventId: number) {
        super(`Invalid event ID: ${eventId}`);
        this.name = 'InvalidEventIdError';
    }
}

export class InvalidEventNameError extends Error {
    constructor() {
        super('Event name is required');
        this.name = 'InvalidEventNameError';
    }
}

export class InvalidTimeRangeError extends Error {
    constructor() {
        super('Start time must be before end time');
        this.name = 'InvalidTimeRangeError';
    }
}

export class TimeConflictError extends Error {
    constructor() {
        super('Time conflict with existing event');
        this.name = 'TimeConflictError';
    }
}