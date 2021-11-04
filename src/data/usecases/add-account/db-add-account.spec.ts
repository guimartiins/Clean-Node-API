import { DbAddAccount } from './db-add-account';
import {
    IHasher,
    IAddAccountModel,
    IAccountModel,
    IAddAccountRepository,
} from './db-add-account-protocols';

const makeHasher = (): IHasher => {
    class HasherStub implements IHasher {
        async hash(password: string): Promise<string> {
            return new Promise((resolve) => resolve('hashed_password'));
        }
    }

    return new HasherStub();
};
const makeFakeAccount = (): IAccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email',
    password: 'hashed_password',
});

const makeFakeAccountData = (): IAddAccountModel => ({
    name: 'valid_name',
    email: 'valid_email',
    password: 'valid_password',
});

const makeAddAccountRepository = (): IAddAccountRepository => {
    class AddAccountRepositoryStub implements IAddAccountRepository {
        async add(account: IAddAccountModel): Promise<IAccountModel> {
            return new Promise((resolve) => resolve(makeFakeAccount()));
        }
    }

    return new AddAccountRepositoryStub();
};

interface ISutTypes {
    sut: DbAddAccount;
    hasherStub: IHasher;
    addAccountRepositoryStub: any;
}

const makeSut = (): ISutTypes => {
    const hasherStub = makeHasher();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub);

    return { hasherStub, sut, addAccountRepositoryStub };
};

describe('DbAddAccount UseCase', () => {
    test('should call Hasher with correct password', () => {
        const { sut, hasherStub } = makeSut();
        const hasherSpy = jest.spyOn(hasherStub, 'hash');
        sut.add(makeFakeAccountData());
        expect(hasherSpy).toHaveBeenCalledWith('valid_password');
    });
    test('should throw if Hasher throws', async () => {
        const { sut, hasherStub } = makeSut();
        jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const promise = sut.add(makeFakeAccountData());
        await expect(promise).rejects.toThrow();
    });
    test('should call AddAccountRepository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
        await sut.add(makeFakeAccountData());
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
        const promise = sut.add(makeFakeAccountData());
        await expect(promise).rejects.toThrow();
    });
    test('should return an account on success', async () => {
        const { sut } = makeSut();
        const account = await sut.add(makeFakeAccountData());
        expect(account).toEqual(makeFakeAccount());
    });
});
