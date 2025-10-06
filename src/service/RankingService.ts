import { EventRepository } from "../repository/EventRepository";
import { UserRepository } from "../repository/UserRepository";
import { EventType, User } from "../database/database";
import { UserWithStats } from "./util";
import { FollowRepository } from "../repository/FollowRepository";
import { FollowRequestRepository } from "../repository/FollowRequestRepository";

export class RankingItem {
    constructor(public readonly rank: number, public readonly user: UserWithStats, public duration_min: number) {}
}

export class Ranking {
    constructor(public readonly eventType: EventType, public readonly ranking: RankingItem[]) {}
}

export class RankingService {
    private rankingCache: Map<EventType, Ranking> = new Map();
    private rankingCacheTime: Map<EventType, number> = new Map();
    private cacheTime: number;
    private rankingStartTime: Date;

    constructor(private readonly eventRepository: EventRepository, private readonly userRepository: UserRepository,
        private readonly followRepository: FollowRepository, private readonly followRequestRepository: FollowRequestRepository, private readonly cacheTime_sec: number = 60 * 10) {
        this.cacheTime = this.cacheTime_sec * 1000;
        this.rankingStartTime = this.updateRankingStartTime();
    }

    // myUser を指定してUserWithStatsを返す
    // （フォロー状態などの情報が付加される）
    public async getRankingsByMyUser(myUser: User | null): Promise<Ranking[]> {
        const rankings = await this.getRankings();
        if (!myUser) {
            return rankings;
        }
        await Promise.all(rankings.map(async ranking => {
            await Promise.all(ranking.ranking.map(async item => {
                item.user.myUser = myUser;
                await item.user.updateStats(this.followRepository, this.followRequestRepository);
            }));
        }));
        return rankings;
    }

    // myUser = null の状態でUserWithStatsを返す（非ログインなど想定）
    public async getRankings(): Promise<Ranking[]> {
        const rankings: Ranking[] = [];
        for (const type of Object.values(EventType)) {
            const ranking = await this.getRankingByType(type);
            rankings.push(ranking);
        }
        return rankings;
    }

    public async getRankingByType(type: EventType): Promise<Ranking> {
        const now = Date.now();
        if (this.rankingCacheTime.has(type) && now - this.rankingCacheTime.get(type)! < this.cacheTime) {
            return this.rankingCache.get(type)!;
        }
        return await this.culRankingByType(type);
    }

    private async culRankingByType(type: EventType): Promise<Ranking> {
        this.rankingStartTime = this.updateRankingStartTime();
        const events = await this.eventRepository.findAllByType(type);
        // <userId, duration_min>
        const tmpMap = new Map<string, number>();
        events.forEach((event) => {
            const userId = event.userId;
            if (event.endTime > new Date() || event.startTime < this.rankingStartTime) {
                return;
            }
            const duration_min = (event.endTime.getTime() - event.startTime.getTime()) / 60000;
            if (tmpMap.has(userId)) {
                tmpMap.set(userId, tmpMap.get(userId)! + duration_min);
            } else {
                tmpMap.set(userId, duration_min);
            }
        });

        const rankingItems = await Promise.all(
            Array.from(tmpMap.entries())
                .sort((a, b) => b[1] - a[1])
                .map(async (entry, index) => {
                    // entry[0] is userId, entry[1] is duration_min
                    const user = await this.userRepository.get(entry[0]);
                    const userWithStats = await UserWithStats.create(user!, null, this.followRepository, this.followRequestRepository);
                    return new RankingItem(index + 1, userWithStats, entry[1]);
                }));

        const ranking = new Ranking(type, rankingItems);
        this.rankingCache.set(type, ranking);
        this.rankingCacheTime.set(type, Date.now());
        return ranking;
    }

    public getRankingStartTime(): Date {
        return this.rankingStartTime;
    }

    private updateRankingStartTime(): Date {
        // 前回の日曜日の開始時刻を設定
        // const today = new Date();
        // const day = today.getDay();
        // const diff = day === 0 ? 7 : day; // 日曜日からの差分を計算
        // const rankingStartTime = new Date(today);
        // rankingStartTime.setDate(today.getDate() - diff);
        // rankingStartTime.setHours(0, 0, 0, 0);

        // 一週間前を開始時刻に設定
        const rankingStartTime = new Date();
        rankingStartTime.setDate(rankingStartTime.getDate() - 7);
        rankingStartTime.setHours(0, 0, 0, 0);
        return rankingStartTime;
    }
}