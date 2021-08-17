import { DbAddAccount } from './db-add-account';
import { IEncrypter } from './db-add-account-protocols';

interface ISutTypes {
    sut: DbAddAccount;
    encrypterStub: IEncrypter;
}

const makeEncrypter = (): IEncrypter => {
    class EncrypterStub {
        async encrypt(password: string): Promise<string> {
            return new Promise((resolve) => resolve('hashed_password'));
        }
    }

    return new EncrypterStub();
};

const makeSut = (): ISutTypes => {
    const encrypterStub = makeEncrypter();
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
    test('should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };
        const promise = sut.add(accountData);
        await expect(promise).rejects.toThrow();
    });
});
