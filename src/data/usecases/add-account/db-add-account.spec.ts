import { DbAddAccount } from './db-add-account';
import {
    IEncrypter,
    IAddAccountModel,
    IAccountModel,
    IAddAccountRepository,
} from './db-add-account-protocols';

const makeEncrypter = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(password: string): Promise<string> {
            return new Promise((resolve) => resolve('hashed_password'));
        }
    }

    return new EncrypterStub();
};

const makeAddAccountRepository = (): IAddAccountRepository => {
    class AddAccountRepositoryStub implements IAddAccountRepository {
        async add(account: IAddAccountModel): Promise<IAccountModel> {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email',
                password: 'hashed_password',
            };
            return new Promise((resolve) => resolve(fakeAccount));
        }
    }

    return new AddAccountRepositoryStub();
};

interface ISutTypes {
    sut: DbAddAccount;
    encrypterStub: IEncrypter;
    addAccountRepositoryStub: any;
}

const makeSut = (): ISutTypes => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);

    return { encrypterStub, sut, addAccountRepositoryStub };
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
    test('should call AddAccountRepository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };
        await sut.add(accountData);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'valid_name',
            email: 'valid_email',
            password: 'hashed_password',
        });
    });
    test('should throw if AddAccountRepository throws', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
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
    test('should return an account on success', async () => {
        const { sut } = makeSut();
        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };
        const account = await sut.add(accountData);
        expect(account).toEqual({
            id: 'valid_id',
            name: 'valid_name',
            email: 'valid_email',
            password: 'hashed_password',
        });
    });
});
