import { Collection } from 'mongodb';

import { MongoHelper } from '../helpers/mongo-helper';
import { AccountMongoRepository } from './account-mongo-repository';

let accountCollection: Collection;

describe('Account Mongo Repository', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL as string);
    });

    afterAll(async () => {
        await MongoHelper.disconnect();
    });

    beforeEach(async () => {
        accountCollection = await MongoHelper.getCollection('accounts');
        await accountCollection.deleteMany({});
    });

    const makeSut = (): AccountMongoRepository => {
        return new AccountMongoRepository();
    };

    test('should return an account on add success', async () => {
        const sut = makeSut();
        const account = await sut.add({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'any_password',
        });
        expect(account).toBeTruthy();
        expect(account.id).toBeTruthy();
        expect(account.name).toBe('any_name');
        expect(account.email).toBe('any_email@email.com');
        expect(account.password).toBe('any_password');
    });

    test('should return an account on loadByEmail success', async () => {
        const sut = makeSut();
        await accountCollection.insertOne({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'any_password',
        });
        const account = await sut.loadByEmail('any_email@email.com');
        expect(account).toBeTruthy();
        expect(account.id).toBeTruthy();
        expect(account.name).toBe('any_name');
        expect(account.email).toBe('any_email@email.com');
        expect(account.password).toBe('any_password');
    });

    test('should return null if loadByEmail fails', async () => {
        const sut = makeSut();
        const account = await sut.loadByEmail('any_email@email.com');
        expect(account).toBeFalsy();
    });

    test('should update the account accessToken on updateAccessToken', async () => {
        const sut = makeSut();
        const res = await accountCollection.insertOne({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'any_password',
        });
        let account: any = await accountCollection.findOne(res.insertedId);
        expect(account.accessToken).toBeFalsy();
        await sut.updateAccessToken(account._id, 'any_token');
        account = await accountCollection.findOne(res.insertedId);
        expect(account).toBeTruthy();
        expect(account.accessToken).toBe('any_token');
    });
});
