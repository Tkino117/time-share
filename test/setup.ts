import { Database } from "../src/database/database";

beforeAll(async () => {
    const database = Database.getInstance();
    await database.connect();
    await database.init();
});

afterAll(async () => {
    const database = Database.getInstance();
    await database.close();
});

