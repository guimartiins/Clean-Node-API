import { DbAuthentication } from './db-authentication';
import {
    IAccountModel,
    IAuthenticationModel,
    IHashComparer,
    IEncrypter,
    ILoadAccountByEmailRepository,
    IUpdateAccessTokenRepository,
} from './db-authentication-protocols';

const makeFakeAccount = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'hashed_password',
});

const makeFakeAuthentication = (): IAuthenticationModel => ({
    email: 'any_email@email.com',
    password: 'any_password',
});

const makeLoadAccountByEmailRepository = (): ILoadAccountByEmailRepository => {
    type NewType = ILoadAccountByEmailRepository;
    class LoadAccountByEmailRepositoryStub implements NewType {
        async loadByEmail(email: string): Promise<IAccountModel> {
            return new Promise((resolve) => resolve(makeFakeAccount()));
        }
    }
    return new LoadAccountByEmailRepositoryStub();
};

const makeHashComparer = (): IHashComparer => {
    class HashComparerStub implements IHashComparer {
        async compare(value: string, hash: string): Promise<boolean> {
            return true;
        }
    }
    return new HashComparerStub();
};

const makeEncrypter = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(id: string): Promise<string> {
            return 'any_token';
        }
    }
    return new EncrypterStub();
};

const makeUpdateAccessTokenRepository = (): IUpdateAccessTokenRepository => {
    class MakeUpdateAccessTokenRepositoryStub
        implements IUpdateAccessTokenRepository
    {
        async updateAccessToken(id: string, token: string): Promise<void> {
            return new Promise((resolve) => resolve());
        }
    }
    return new MakeUpdateAccessTokenRepositoryStub();
};

interface ISutTypes {
    sut: DbAuthentication;
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository;
    hashComparerStub: IHashComparer;
    encrypterStub: IEncrypter;
    updateAccessTokenRepositoryStub: IUpdateAccessTokenRepository;
}

const makeSut = (): ISutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const hashComparerStub = makeHashComparer();
    const encrypterStub = makeEncrypter();
    const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository();
    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub
    );
    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub,
    };
};

describe('DbAuthentication UseCase', () => {
    test('should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'loadByEmail'
        );
        await sut.auth(makeFakeAuthentication());
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should throw if LoadAccountByEmailRepository throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'loadByEmail'
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

    test('should return null if LoadAccountByEmailRepository returns null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'loadByEmail'
        ).mockReturnValueOnce(null);
        const accessToken = await sut.auth(makeFakeAuthentication());
        expect(accessToken).toBeNull();
    });

    test('should call HashComparer with correct values', async () => {
        const { sut, hashComparerStub } = makeSut();
        const compareSpy = jest.spyOn(hashComparerStub, 'compare');
        await sut.auth(makeFakeAuthentication());
        expect(compareSpy).toHaveBeenCalledWith(
            'any_password',
            'hashed_password'
        );
    });

    test('should throw if HashComparer throws', async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

    test('should return null if HashComparer returns false', async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(
            new Promise((resolve) => resolve(false))
        );
        const accessToken = await sut.auth(makeFakeAuthentication());
        expect(accessToken).toBeNull();
    });

    test('should call Encrypter with correct id', async () => {
        const { sut, encrypterStub } = makeSut();
        const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt');
        await sut.auth(makeFakeAuthentication());
        expect(encrypterSpy).toHaveBeenCalledWith('any_id');
    });

    test('should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });

    test('should return a token on success', async () => {
        const { sut } = makeSut();
        const accessToken = await sut.auth(makeFakeAuthentication());
        expect(accessToken).toBe('any_token');
    });

    test('should call UpdateAccessTokenRepository with correct values', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        const updateSpy = jest.spyOn(
            updateAccessTokenRepositoryStub,
            'updateAccessToken'
        );
        await sut.auth(makeFakeAuthentication());
        expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token');
    });

    test('should throw if UpdateAccessTokenRepository throws', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        jest.spyOn(
            updateAccessTokenRepositoryStub,
            'updateAccessToken'
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const promise = sut.auth(makeFakeAuthentication());
        expect(promise).rejects.toThrow();
    });
});
