import { UserRepository, UserUpdateInput, UserCreateInput } from "../repository/UserRepository";
import { SessionManager } from "../repository/SessionManager";
import { UserPrivacy, User, UserSettings } from "../database/database";
import { UserNotFoundError, UserAlreadyExistsError, InvalidPasswordError, InvalidUserIdError, InvalidNameError, UnauthorizedError } from "./errors";
import { UserWithStats } from "./util";
import { FollowRepository } from "../repository/FollowRepository";
import { FollowRequestRepository } from "../repository/FollowRequestRepository";


export class UserSettingsUpdateInput {
    public privacy?: UserPrivacy;
}

export class UserService {
    private readonly passwordMinLength = 1;
    private readonly nameMinLength = 1;
    private readonly userIdMinLength = 1;
    private readonly userIdMaxLength = 20;
    constructor(private readonly userRepository: UserRepository, private readonly sessionManager: SessionManager, private readonly followRepository: FollowRepository, private readonly followRequestRepository: FollowRequestRepository) {

    }

    public async createUser(user: UserCreateInput): Promise<User> {
        const validatedUserId = this.validateUserId(user.userId);
        if (await this.userRepository.exists(validatedUserId)) {
            throw new UserAlreadyExistsError(validatedUserId);
        }
        if (user.password.length < this.passwordMinLength) {
            throw new InvalidPasswordError();
        }
        if (user.name.length < this.nameMinLength) {
            throw new InvalidNameError();
        }
        const createdUser = await this.userRepository.create(user);
        return createdUser;
    }   

    public async deleteUser(userId: string): Promise<boolean> {
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
        }
        const deleted = await this.userRepository.delete(userId);
        return deleted;
    }

    public async updateUser(userId: string, updateData: UserUpdateInput): Promise<User> {
        const validatedUserId = this.validateUserId(updateData.userId);
        if (!await this.userRepository.exists(validatedUserId)) {
            throw new UserNotFoundError(validatedUserId);
        }
        if (updateData.userId && updateData.userId !== userId) {
            throw new InvalidUserIdError();
        }
        if (updateData.userId && updateData.userId.length < this.userIdMinLength) {
            throw new InvalidUserIdError();
        }
        if (updateData.userId && await this.userRepository.exists(updateData.userId)) {
            throw new UserAlreadyExistsError(updateData.userId);
        }
        if (updateData.userId && updateData.userId === userId) {
            throw new InvalidUserIdError();
        }
        if (updateData.password && updateData.password.length < this.passwordMinLength) {
            throw new InvalidPasswordError();
        }
        if (updateData.name && updateData.name.length < this.nameMinLength) {
            throw new InvalidNameError();
        }
        const updatedUser = await this.userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new UserNotFoundError(userId);
        }
        return updatedUser;
    }

    public async getUser(userId: string): Promise<User> {
        const user = await this.userRepository.get(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }
        return user;
    }

    public async getUserWithStats(userId: string, myUserId: string | null): Promise<UserWithStats> {
        const user = await this.getUser(userId);
        if (userId === myUserId) {
            myUserId = null;
        }
        if (myUserId) {
            const myUser = await this.getUser(myUserId);
            return UserWithStats.create(user, myUser, this.followRepository, this.followRequestRepository);
        }
        return UserWithStats.create(user, null, this.followRepository, this.followRequestRepository);
    }

    // return sessionId
    public async login(userId: string, password: string): Promise<string> {
        const user = await this.userRepository.get(userId);
        if (!user) throw new UserNotFoundError(userId);
        if (user.password !== password) throw new InvalidPasswordError();

        const session = this.sessionManager.createSession(userId, new Date());
        return session.sessionId;
    }

    public async logout(sessionId: string): Promise<void> {
        this.sessionManager.deleteSession(sessionId);
    }

    public async getUserFromSession(sessionId: string): Promise<User | null> {
        const session = this.sessionManager.getSession(sessionId);
        if (!session) throw new UnauthorizedError();
        const user = await this.userRepository.get(session.userId);
        return user;
    }

    public async searchUser(query: string, myUserId: string): Promise<User[]> {
        if (query == '') {
            // !note! あとでエラーをつくる
            throw new Error('query is empty');
        }
        const users = await this.userRepository.search(query);
        for (const user of users) {
            if (user.userId === myUserId) {
                users.splice(users.indexOf(user), 1);
            }
        }
        return users;
    }


    // セッションを検証してユーザーIDを返す
    public async authorize(sessionId: string): Promise<string | null> {
        const session = this.sessionManager.getSession(sessionId);
        if (!session) throw new UnauthorizedError();
        return session.userId;
    }

    public async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    private validateUserId(userId: string | undefined): string {
        if (!userId) {
            throw new InvalidUserIdError();
        }
        // 前後の半角スペースを切り取る
        const trimmedUserId = userId.trim();
        
        // 半角英数のみであるかチェック
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(trimmedUserId)) {
            throw new InvalidUserIdError();
        }
        if (trimmedUserId.length < this.userIdMinLength) {
            throw new InvalidUserIdError();
        }
        if (trimmedUserId.length > this.userIdMaxLength) {
            throw new InvalidUserIdError();
        }
        return trimmedUserId;
    }

    public async getSettings(userId: string): Promise<UserSettings> {
        const user = await this.getUser(userId);
        return user.settings;
    }

    public async updateSettings(userId: string, settings: UserSettingsUpdateInput): Promise<UserSettings> {
        const user = await this.getUser(userId);
        if (settings.privacy) {
            user.settings.privacy = settings.privacy;
        }
        await this.userRepository.update(userId, { settings: user.settings });
        return user.settings;
    }
}