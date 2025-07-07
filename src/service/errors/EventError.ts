import { AbstractError } from "./AbstractError";

export class EventNotFoundError extends AbstractError {
    constructor(eventId: number) {
        super(`Event not found: ${eventId}`, 'EventNotFoundError');
    }
}

export class InvalidEventIdError extends AbstractError {
    constructor(eventId: number) {
        super(`Invalid event ID: ${eventId}`, 'InvalidEventIdError');
    }
}

export class InvalidEventNameError extends AbstractError {
    constructor() {
        super('Event name is required', 'InvalidEventNameError');
    }
}

export class InvalidTimeRangeError extends AbstractError {
    constructor() {
        super('Start time must be before end time', 'InvalidTimeRangeError');
    }
}

export class TimeConflictError extends AbstractError {
    constructor() {
        super('Time conflict with existing event', 'TimeConflictError');
    }
}

export class InvalidEventTypeError extends AbstractError {
    constructor(public readonly type: string | undefined) {
        super(`Invalid event type: ${type}`, 'InvalidEventTypeError');
    }
}