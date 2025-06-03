import { Database } from '../database/database';

export class FollowRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    /**
     * フォロー関係を作成する
     * @param followee フォローされるユーザーID
     * @param follower フォローするユーザーID
     */
    public async create(followee: string, follower: string): Promise<void> {
        const Follow = this.db.getFollowModel();
        await Follow.create({
            followee,
            follower
        });
    }

    /**
     * フォロー関係を削除する
     * @param followee フォローされるユーザーID
     * @param follower フォローするユーザーID
     */
    public async delete(followee: string, follower: string): Promise<void> {
        const Follow = this.db.getFollowModel();
        await Follow.destroy({
            where: {
                followee,
                follower
            }
        });
    }

    /**
     * フォロー関係が存在するか確認する
     * @param followee フォローされるユーザーID
     * @param follower フォローするユーザーID
     * @returns フォロー関係が存在する場合はtrue
     */
    public async exists(followee: string, follower: string): Promise<boolean> {
        const Follow = this.db.getFollowModel();
        const follow = await Follow.findOne({
            where: {
                followee,
                follower
            }
        });
        return follow !== null;
    }

    /**
     * ユーザーがフォローしているユーザーIDのリストを取得する
     * @param userId ユーザーID
     * @returns フォローしているユーザーIDのリスト
     */
    public async getFollowees(userId: string): Promise<string[]> {
        const Follow = this.db.getFollowModel();
        const follows = await Follow.findAll({
            where: {
                follower: userId
            }
        });
        return follows.map(follow => follow.followee);
    }

    /**
     * ユーザーをフォローしているユーザーIDのリストを取得する
     * @param userId ユーザーID
     * @returns フォロワーのユーザーIDのリスト
     */
    public async getFollowers(userId: string): Promise<string[]> {
        const Follow = this.db.getFollowModel();
        const follows = await Follow.findAll({
            where: {
                followee: userId
            }
        });
        return follows.map(follow => follow.follower);
    }
}
