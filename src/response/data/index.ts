import { UserWithStats } from "../../service/util";
import { User, Event, EventType, NotificationType, Notification, UserSettings, UserPrivacy } from "../../database/database";
import { Ranking } from "../../service/RankingService";

export abstract class AbstractResponseData {
    abstract toJSON(): any;
}

export class EmptyResponseData extends AbstractResponseData {
    toJSON(): any {
        return {};
    }
}

// !note!将来的に使わない
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

export class UserWithStatsResponseData extends AbstractResponseData {
    userId: string;
    name: string;
    followingCount: number;
    followerCount: number;
    privacy: UserPrivacy;

    constructor(userWithStats: UserWithStats) {
        super();
        this.userId = userWithStats.userId;
        this.name = userWithStats.name;    
        this.followingCount = userWithStats.followingCount;
        this.followerCount = userWithStats.followerCount;
        this.privacy = userWithStats.privacy;
    }

    toJSON(): any {
        return {
            userId: this.userId,
            name: this.name,
            followingCount: this.followingCount,
            followerCount: this.followerCount,
            privacy: this.privacy
        };
    }
}

export class UsersWithStatsResponseData extends AbstractResponseData {
    usersWithStats: UserWithStatsResponseData[];

    constructor(users: UserWithStats[]) {
        super();
        this.usersWithStats = users.map(user => new UserWithStatsResponseData(user));
    }

    toJSON(): any {
        return {
            users: this.usersWithStats.map(userWithStats => userWithStats.toJSON())
        };
    }
}

// !note!将来的に使わない（開発用で残すかも）
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
    type: EventType;
    isPublic: boolean;

    constructor(event: Event) {
        super();
        this.id = event.id;
        this.userId = event.userId;
        this.name = event.name;
        this.startTime = event.startTime.toISOString();
        this.endTime = event.endTime.toISOString();
        this.isDone = event.isDone;
        this.type = event.type;
        this.isPublic = event.isPublic;
    }

    toJSON(): any {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            startTime: this.startTime,
            endTime: this.endTime,
            isDone: this.isDone,
            type: this.type,
            isPublic: this.isPublic
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

export class RankingResponseData extends AbstractResponseData {
    ranking: Ranking;
    rankingStartTime: Date;

    constructor(ranking: Ranking, rankingStartTime: Date) {
        super();
        this.ranking = ranking;
        this.rankingStartTime = rankingStartTime;
    }

    toJSON(): any {
        return {
            type: this.ranking.eventType,
            ranking: this.ranking.ranking.map(item => ({
                rank: item.rank,
                user: new UserWithStatsResponseData(item.user),
                duration_min: item.duration_min
            })),
            rankingStartTime: this.rankingStartTime.toISOString()
        };
    }
}

export class RankingsResponseData extends AbstractResponseData {
    rankings: RankingResponseData[];

    constructor(rankings: Ranking[], rankingStartTime: Date) {
        super();
        this.rankings = rankings.map(ranking => new RankingResponseData(ranking, rankingStartTime));
    }

    toJSON(): any {
        return {
            rankings: this.rankings.map(ranking => ranking.toJSON())
        };
    }
}

export class NotificationResponseData extends AbstractResponseData {
    id: number;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: object;

    constructor(notification: Notification) {
        super();
        this.id = notification.id;
        this.userId = notification.userId;
        this.type = notification.type;
        this.title = notification.title;
        this.message = notification.message;
        this.isRead = notification.isRead;
        this.metadata = notification.metadata;
    }

    toJSON(): any {
        return {
            id: this.id,
            userId: this.userId,
            type: this.type,
            title: this.title,
            message: this.message,
            isRead: this.isRead,
            metadata: this.metadata
        };
    }
}

export class NotificationsResponseData extends AbstractResponseData {
    notifications: NotificationResponseData[];

    constructor(notifications: Notification[]) {
        super();
        this.notifications = notifications.map(notification => new NotificationResponseData(notification));
    }

    toJSON(): any {
        return {
            notifications: this.notifications.map(notification => notification.toJSON())
        };
    }
}

export class UserSettingsResponseData extends AbstractResponseData {
    userSettings: UserSettings;
    
    constructor(userSettings: UserSettings) {
        super();
        this.userSettings = userSettings;
    }

    toJSON(): any {
        return {
            privacy: this.userSettings.privacy
        };
    }
}


export class FollowRequestsResponseData extends AbstractResponseData {
    users: UserWithStatsResponseData[];

    constructor(users: UserWithStats[]) {
        super();
        this.users = users.map(user => new UserWithStatsResponseData(user));
    }

    toJSON(): any {
        return {
            users: this.users.map(user => user.toJSON())
        };
    }
}