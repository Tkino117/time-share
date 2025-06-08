import { UserRepository, UserUpdateInput, UserCreateInput } from "../repository/userRepository";
import { SessionManager } from "../repository/sessionManager";
import { User } from "../database/database";
import { UserNotFoundError, UserAlreadyExistsError, InvalidPasswordError } from "./errors";

export class UserService {
    constructor(private readonly userRepository: UserRepository, private readonly sessionManager: SessionManager) {

    }

    public async createUser(user: UserCreateInput): Promise<User> {
        if (await this.userRepository.exists(user.userId)) {
            throw new UserAlreadyExistsError(user.userId);
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

    public async updateUser(userId: string, updateData: UserUpdateInput): Promise<User | null> {
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
        }
        const updatedUser = await this.userRepository.update(userId, updateData);
        return updatedUser;
    }

    public async getUser(userId: string): Promise<User | null> {
        const user = await this.userRepository.get(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }
        return user;
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
        if (!session) return null;
        const user = await this.userRepository.get(session.userId);
        return user;
    }
}