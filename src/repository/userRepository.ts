import { Database } from '../database/database';

export class UserRepository {
    private db: Database;
    
    constructor() {
        this.db = Database.getInstance();
    }

    // 新規ユーザーを作成する
    public async create(userId: string, password: string, name: string): Promise<void> {
        const User = this.db.getUserModel();
        await User.create({
            userId,
            password,
            name
        });
    }

    // ユーザーを削除する
    public async delete(userId: string): Promise<void> {
        const User = this.db.getUserModel();
        await User.destroy({
            where: { userId }
        });
    }

    // ユーザー情報を更新する
    public async update(userId: string, name: string): Promise<void> {
        const User = this.db.getUserModel();
        await User.update({ name }, {
            where: { userId }
        });
    }

    // ユーザーが存在するか確認する
    public async exists(userId: string): Promise<boolean> {
        const User = this.db.getUserModel();
        const user = await User.findByPk(userId);
        return user !== null;
    }

    // ユーザー情報を取得する
    public async get(userId: string): Promise<{userId: string, name: string} | null> {
        const User = this.db.getUserModel();
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        return {
            userId: user.userId,
            name: user.name
        };
    }

    // ユーザー情報をパスワードごと取得する
    public async getWithPassword(userId: string): Promise<{userId: string, password: string, name: string} | null> {
        const User = this.db.getUserModel();
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        return {
            userId: user.userId,
            password: user.password,
            name: user.name
        };
    }
}

