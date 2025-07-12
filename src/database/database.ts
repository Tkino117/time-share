import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

export type UserSettings = {
    privacy: UserPrivacy;
}

export enum UserPrivacy {
    PUBLIC = 'public',
    PROTECTED = 'protected',
    PRIVATE = 'private'
}

export class User extends Model {
    public userId!: string;
    public password!: string;
    public name!: string;
    public profileImageUrl?: string;
    public settings!: UserSettings;
}

export class Follow extends Model {
    public id!: number;
    public follower!: string;
    public following!: string;
}

export enum EventType {
    MEAL = 'meal',
    SLEEP = 'sleep',
    WORK = 'work',
    EXERCISE = 'exercise',
    STUDY = 'study',
    OTHER = 'other'
}

export class Event extends Model {
    public id!: number;
    public userId!: string;
    public name!: string;
    public startTime!: Date;
    public endTime!: Date;
    public isDone!: boolean;
    public type!: EventType;
    public isPublic!: boolean;
}

export enum NotificationType {
    FOLLOW = 'follow',
    FOLLOW_REQUEST = 'follow_request',
    FOLLOW_REQUEST_ACCEPTED = 'follow_request_accepted',
    EVENT_SHARE = 'event_share',
    EVENT_LIKE = 'event_like',
    EVENT_COMMENT = 'event_comment',
    ACHIEVEMENT = 'achievement',
    REMINDER = 'reminder',
    SYSTEM = 'system',
    OTHER = 'other'
}

export class Notification extends Model {
    public id!: number;
    public userId!: string;
    public type!: NotificationType;
    public title!: string;
    public message!: string;
    public isRead!: boolean;
    public metadata?: object;
}

// 一旦、承認と拒否のみ（拒否されたら削除）
export enum FollowRequestStatus {
    PENDING = 'pending',
}

export class FollowRequest extends Model {
    public id!: number;
    public fromUserId!: string;
    public toUserId!: string;
    public status!: FollowRequestStatus;
}

export class Database {
    private static instance: Database;
    private sequelize: Sequelize;

    private constructor() {
        const dbPath = path.resolve(__dirname, '../../database.sqlite');
        
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false
        });

        this.initUserModel();
        this.initFollowModel();
        this.initEventModel();
        this.initNotificationModel();
        this.initFollowRequestModel();
    }

    private initUserModel(): void {
        User.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            profileImageUrl: {
                type: DataTypes.STRING,
                allowNull: true
            },
            settings: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: { privacy: 'public' }
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true
        });
    }

    private initFollowModel(): void {
        Follow.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            follower: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
            following: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
        }, {
            sequelize: this.sequelize,
            modelName: 'Follow',
            tableName: 'follows',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['follower', 'following']
                }
            ]
        });
    }

    private initEventModel(): void {
        Event.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: false
            },
            isDone: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            type: {
                type: DataTypes.ENUM(...Object.values(EventType)),
                allowNull: false,
                defaultValue: EventType.OTHER
            },
            isPublic: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Event',
            tableName: 'events',
            timestamps: true
        });
    }

    private initNotificationModel(): void {
        Notification.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
            type: {
                type: DataTypes.ENUM(...Object.values(NotificationType)),
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Notification',
            tableName: 'notifications',
            timestamps: true,
            indexes: [
                {
                    fields: ['userId', 'isRead']
                },
                {
                    fields: ['userId', 'createdAt']
                },
                {
                    fields: ['type']
                }
            ]
        });
    }

    private initFollowRequestModel(): void {
        FollowRequest.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            fromUserId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
            toUserId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
            status: {
                type: DataTypes.ENUM(...Object.values(FollowRequestStatus)),
                allowNull: false,
                defaultValue: FollowRequestStatus.PENDING
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'FollowRequest',
            tableName: 'follow_requests',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['fromUserId', 'toUserId']
                }
            ]
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            console.log('データベースに接続しました。');
        } catch (error) {
            console.error('データベース接続エラー:', error);
            throw error;
        }
    }

    public async init(): Promise<void> {
        try {
            await this.sequelize.sync({ force: true });
            console.log('データベースを初期化しました。');
        } catch (error) {
            console.error('データベース初期化エラー:', error);
            throw error;
        }
    }

    public async close(): Promise<void> {
        await this.sequelize.close();
        console.log('データベースを閉じました。');
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }
}





