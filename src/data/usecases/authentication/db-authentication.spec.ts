import { IAccountModel } from '../../../domain/models/account';
import { ILoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository';
import { DbAuthentication } from './db-authentication';

describe('DbAuthentication UseCase', () => {
    test('should call LoadAccountByEmailRepository with correct email', async () => {
        type NewType = ILoadAccountByEmailRepository;

        class LoadAccountByEmailRepositoryStub implements NewType {
            async load(email: string): Promise<IAccountModel> {
                const account: IAccountModel = {
                    id: 'any_id',
                    name: 'any_name',
                    email: 'any_email@email.com',
                    password: 'any_password',
                };
                return new Promise((resolve) => resolve(account));
            }
        }

        const loadAccountByEmailRepositoryStub =
            new LoadAccountByEmailRepositoryStub();
        const sut = new DbAuthentication(loadAccountByEmailRepositoryStub);
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
        await sut.auth({
            email: 'any_email@email.com',
            password: 'any_password',
        });
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com');
    });
});
