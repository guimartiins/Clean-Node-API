import { MongoHelper as sut } from './mongo-helper';

describe('Mongo Helper', () => {
    beforeAll(async () => {
        console.log(process.env.MONGO_URL);
        await sut.connect(process.env.MONGO_URL as string);
    });
    afterAll(async () => {
        await sut.disconnect();
    });
    test('should reconnect if mongodb is down', async () => {
        let accountCollection = await sut.getCollection('accounts');
        expect(accountCollection).toBeTruthy();

        await sut.disconnect();
        accountCollection = await sut.getCollection('accounts');
        expect(accountCollection).toBeTruthy();
    });
});
