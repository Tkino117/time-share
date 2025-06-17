import { EventRepository } from "../repository/EventRepository";
import { UserRepository } from "../repository/UserRepository";
import { EventType, User } from "../database/database";

export class RankingItem {
    constructor(public readonly rank: number, public readonly user: User, public duration_min: number) {}
}

export class Ranking {
    constructor(public readonly eventType: EventType, public readonly ranking: RankingItem[]) {}
}

export class RankingService {
    private rankingCache: Map<EventType, Ranking> = new Map();
    private rankingCacheTime: Map<EventType, number> = new Map();
    private cacheTime: number;

    constructor(private readonly eventRepository: EventRepository,
        private readonly userRepository: UserRepository, cacheTime_sec: number = 60 * 10) {
            this.cacheTime = cacheTime_sec * 1000;
        }

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
        const events = await this.eventRepository.findAllByType(type);
        const tmpMap = new Map<string, number>();
        events.forEach((event) => {
            const userId = event.userId;
            if (event.endTime > new Date()) {
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
                    const user = await this.userRepository.get(entry[0]);
                    if (!user) throw new Error(`User not found: ${entry[0]} in RankingService.getRanking`);
                    return new RankingItem(index + 1, user, entry[1]);
                })
        );

        const ranking = new Ranking(type, rankingItems);
        this.rankingCache.set(type, ranking);
        this.rankingCacheTime.set(type, Date.now());
        return ranking;
    }
}