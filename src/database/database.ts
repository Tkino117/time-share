import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

export class User extends Model {
    public userId!: string;
    public password!: string;
    public name!: string;
}

export class Follow extends Model {
    public id!: number;
    public followee!: string;
    public follower!: string;
}

export class Event extends Model {
    public id!: number;
    public userId!: string;
    public name!: string;
    public startTime!: Date;
    public endTime!: Date;
    public isDone!: boolean;
}

export class Database {
    private static instance: Database;
    private sequelize: Sequelize;

    private constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.join(__dirname, '../database.sqlite'),
            logging: false
        });

        this.initUserModel();
        this.initFollowModel();
        this.initEventModel();
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
            followee: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                }
            },
            follower: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userId'
                }
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Follow',
            tableName: 'follows',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['followee', 'follower']
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
                }
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
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Event',
            tableName: 'events',
            timestamps: true
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





