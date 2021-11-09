import request from 'supertest';

import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';
import app from '../config/app';

describe('Login routes', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL as string);
    });

    afterAll(async () => {
        await MongoHelper.disconnect();
    });

    beforeEach(async () => {
        const accountCollection = await MongoHelper.getCollection('accounts');
        await accountCollection.deleteMany({});
    });

    describe('POST /signup', () => {
        test('should return 200 on signup', async () => {
            await request(app)
                .post('/api/signup')
                .send({
                    name: 'Guilherme',
                    email: 'guilherme@teste.com',
                    password: 'teste123',
                    passwordConfirmation: 'teste123',
                })
                .expect(200);
        });
    });
});
