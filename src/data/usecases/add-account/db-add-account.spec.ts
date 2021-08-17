import { IEncrypter } from '../../protocols/encrypter';
import { DbAddAccount } from './db-add-account';

interface ISutTypes {
    sut: DbAddAccount;
    encrypterStub: IEncrypter;
}

const makeSut = (): ISutTypes => {
    class EncrypterStub {
        async encrypt(password: string): Promise<string> {
            return new Promise((resolve) => resolve('hashed_password'));
        }
    }
    const encrypterStub = new EncrypterStub();
    const sut = new DbAddAccount(encrypterStub);

    return { encrypterStub, sut };
};

describe('DbAddAccount UseCase', () => {
    test('should call Encrypter with correct password', () => {
        const { sut, encrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };
        sut.add(accountData);
        expect(encryptSpy).toHaveBeenCalledWith('valid_password');
    });
});
