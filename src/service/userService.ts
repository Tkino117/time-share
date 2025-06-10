import { UserRepository, UserUpdateInput, UserCreateInput } from "../repository/userRepository";
import { SessionManager } from "../repository/sessionManager";
import { User } from "../database/database";
import { UserNotFoundError, UserAlreadyExistsError, InvalidPasswordError, InvalidUserIdError, InvalidNameError, UnauthorizedError } from "./errors";

export class UserService {
    private readonly passwordMinLength = 1;
    private readonly nameMinLength = 1;
    private readonly userIdMinLength = 1;

    constructor(private readonly userRepository: UserRepository, private readonly sessionManager: SessionManager) {

    }

    public async createUser(user: UserCreateInput): Promise<User> {
        if (await this.userRepository.exists(user.userId)) {
            throw new UserAlreadyExistsError(user.userId);
        }
        if (user.userId.length < this.userIdMinLength) {
            throw new InvalidUserIdError();
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
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
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

    // セッションを検証してユーザーIDを返す
    public async authorize(sessionId: string): Promise<string | null> {
        const session = this.sessionManager.getSession(sessionId);
        if (!session) throw new UnauthorizedError();
        return session.userId;
    }

    public async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}