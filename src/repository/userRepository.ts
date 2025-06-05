import { Database, User } from '../database/database';

export class UserRepository {
    private db: Database;
    
    constructor() {
        this.db = Database.getInstance();
    }

    // 新規ユーザーを作成する
    public async create(userId: string, password: string, name: string): Promise<User> {
        return await User.create({
            userId,
            password,
            name
        });
    }

    // ユーザーを削除する
    public async delete(userId: string): Promise<boolean> {
        const user = await User.findByPk(userId);
        if (!user) return false;
        await user.destroy();
        return true;
    }

    // ユーザー情報を更新する
    public async update(userId: string, name: string): Promise<User | null> {
        const user = await User.findByPk(userId);
        if (!user) return null;
        await user.update({ name });
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
}

