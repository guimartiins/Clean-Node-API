import { IAccountModel } from '../../../domain/models/account';
import { IAuthenticationModel } from '../../../domain/usecases/authentication';
import { IHashComparer } from '../../protocols/criptography/hash-comparer';
import { ITokenGenerator } from '../../protocols/criptography/token-generator';
import { ILoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository';
import { DbAuthentication } from './db-authentication';

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
        async load(email: string): Promise<IAccountModel> {
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

const makeTokenGenerator = (): ITokenGenerator => {
    class TokenGeneratorStub implements ITokenGenerator {
        async generate(id: string): Promise<string> {
            return 'token';
        }
    }
    return new TokenGeneratorStub();
};

interface ISutTypes {
    sut: DbAuthentication;
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository;
    hashComparerStub: IHashComparer;
    tokenGeneratorStub: ITokenGenerator;
}

const makeSut = (): ISutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const hashComparerStub = makeHashComparer();
    const tokenGeneratorStub = makeTokenGenerator();
    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        tokenGeneratorStub
    );
    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        tokenGeneratorStub,
    };
};

describe('DbAuthentication UseCase', () => {
    test('should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
        await sut.auth(makeFakeAuthentication());
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should throw if LoadAccountByEmailRepository throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'load'
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
            'load'
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

    test('should call TokenGenerator with correct id', async () => {
        const { sut, tokenGeneratorStub } = makeSut();
        const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate');
        await sut.auth(makeFakeAuthentication());
        expect(generateSpy).toHaveBeenCalledWith('any_id');
    });
});
