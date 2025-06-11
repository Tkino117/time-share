import { User, Event } from "../../database/database";

export abstract class AbstractResponseData {
    abstract toJSON(): any;
}

export class EmptyResponseData extends AbstractResponseData {
    toJSON(): any {
        return {};
    }
}

export class UserResponseData extends AbstractResponseData {
    userId: string;
    name: string;

    constructor(user: User) {
        super();
        this.userId = user.userId;
        this.name = user.name;
    }

    toJSON(): any {
        return {
            userId: this.userId,
            name: this.name
        };
    }
}

export class UsersResponseData extends AbstractResponseData {
    users: UserResponseData[];

    constructor(users: User[]) {
        super();
        this.users = users.map(user => new UserResponseData(user));
    }

    toJSON(): any {
        return {
            users: this.users.map(user => user.toJSON())
        };
    }
}

export class EventResponseData extends AbstractResponseData {
    id: number;
    userId: string;
    name: string;
    startTime: string;
    endTime: string;
    isDone: boolean;

    constructor(event: Event) {
        super();
        this.id = event.id;
        this.userId = event.userId;
        this.name = event.name;
        this.startTime = event.startTime.toISOString();
        this.endTime = event.endTime.toISOString();
        this.isDone = event.isDone;
    }

    toJSON(): any {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            startTime: this.startTime,
            endTime: this.endTime,
            isDone: this.isDone
        };
    }
}

export class EventsResponseData extends AbstractResponseData {
    events: EventResponseData[];

    constructor(events: Event[]) {
        super();
        this.events = events.map(event => new EventResponseData(event));
    }

    toJSON(): any {
        return {
            events: this.events.map(event => event.toJSON())
        };
    }
}

export class UserEventsResponseData extends AbstractResponseData {
    user: UserResponseData;
    events: EventsResponseData;

    constructor(user: User, events: Event[]) {
        super();
        this.user = new UserResponseData(user);
        this.events = new EventsResponseData(events);
    }

    toJSON(): any {
        return {
            user: this.user.toJSON(),
            events: this.events.toJSON()
        };
    }
}

export class FeedResponseData extends AbstractResponseData {
    userEvents: UserEventsResponseData[];

    constructor(userEvents: UserEventsResponseData[]) {
        super();
        this.userEvents = userEvents;
    }

    toJSON(): any {
        return {
            userEvents: this.userEvents.map(userEvent => userEvent.toJSON())
        };
    }
}