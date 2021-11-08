import bcrypt from 'bcrypt';

import { BcryptAdapter } from './bcrypt-adapter';

jest.mock('bcrypt', () => ({
    async hash(): Promise<string> {
        return new Promise((resolve) => resolve('hash'));
    },

    async compare(): Promise<boolean> {
        return new Promise((resolve) => resolve(true));
    },
}));

const salt = 12;
const makeSut = (): BcryptAdapter => {
    const sut = new BcryptAdapter(salt);
    return sut;
};

describe('Bcrypt Adapter', () => {
    test('should call hash with correct value', async () => {
        const sut = makeSut();
        const hashSpy = jest.spyOn(bcrypt, 'hash');
        await sut.hash('any_value');
        expect(hashSpy).toHaveBeenCalledWith('any_value', salt);
    });
    test('should return a valid hash on hash success', async () => {
        const sut = makeSut();
        const hash = await sut.hash('any_value');
        expect(hash).toBe('hash');
    });
    test('should throw if hash throws', async () => {
        const sut = makeSut();
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => {
            return new Promise((resolve, reject) => reject(new Error()));
        });
        const promise = sut.hash('any_value');
        await expect(promise).rejects.toThrow();
    });

    test('should call compare with correct value', async () => {
        const sut = makeSut();
        const hashSpy = jest.spyOn(bcrypt, 'compare');
        await sut.compare('any_value', 'any_hash');
        expect(hashSpy).toHaveBeenCalledWith('any_value', 'any_hash');
    });

    test('should return true when compare succeeds', async () => {
        const sut = makeSut();
        const isValid = await sut.compare('any_value', 'any_hash');
        expect(isValid).toBeTruthy();
    });

    test('should return false when compare fails', async () => {
        const sut = makeSut();
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(
            async () => new Promise((resolve) => resolve(false as any))
        );
        const isValid = await sut.compare('any_value', 'any_hash');
        expect(isValid).toBeFalsy();
    });

    test('should throw if compare throws', async () => {
        const sut = makeSut();
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => {
            return new Promise((resolve, reject) => reject(new Error()));
        });
        const promise = sut.compare('any_value', 'any_hash');
        await expect(promise).rejects.toThrow();
    });
});
