import { Database, User } from '../database/database';

export type UserCreateInput = {
    userId: string;
    password: string;
    name: string;
}

export type UserUpdateInput = {
    name?: string;
    password?: string;
}

export class UserRepository {
    private db: Database;
    
    constructor() {
        this.db = Database.getInstance();
    }

    // 新規ユーザーを作成する
    public async create(user: UserCreateInput): Promise<User> {
        return await User.create({
            userId: user.userId,
            password: user.password,
            name: user.name
        });
    }

    // ユーザーを削除する
    public async delete(userId: string): Promise<boolean> {
        const user = await User.findByPk(userId);
        if (!user) return false;
        await user.destroy();
        return true;
    }

    // ユーザー情報を更新する : !note! パスワードを更新できるようにしたい
    public async update(userId: string, updateData: UserUpdateInput): Promise<User | null> {
        const user = await User.findByPk(userId);
        if (!user) return null;
        await user.update(updateData);
        return user;
    }

    // ユーザーが存在するか確認する
    public async exists(userId: string): Promise<boolean> {
        const user = await User.findByPk(userId);
        return user !== null;
    }

    // ユーザー情報を取得する
    public async get(userId: string): Promise<User | null> {
        const user = await User.findByPk(userId);
        return user;
    }

    // ユーザー情報をパスワードごと取得する
    public async getWithoutPassword(userId: string): Promise<User | null> {
        const user = await User.findByPk(userId);
        if (!user) return null;
        user.password = "";
        return user;
    }

    public async findAll(): Promise<User[]> {
        return await User.findAll();
    }

    public async clearAll(): Promise<void> {
        await User.destroy({
            where: {}
        });
    }
}

