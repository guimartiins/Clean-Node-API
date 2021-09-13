import request from 'supertest';

import app from '../config/app';

describe('SignUp routes', () => {
    test('should return an account on success', async () => {
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
