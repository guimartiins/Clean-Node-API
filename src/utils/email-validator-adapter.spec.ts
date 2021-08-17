import validator from 'validator';

import { EmailValidatorAdapter } from './email-validator-adapter';

jest.mock('validator', () => ({
    isEmail(): boolean {
        return true;
    },
}));

describe('EmailValidator Adapter', () => {
    test('should return false if validator returns false', () => {
        const sut = new EmailValidatorAdapter();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false);
        const isValid = sut.isValid('invalid_email@email.com');
        expect(isValid).toBe(false);
    });
    test('should return true if validator returns true', () => {
        const sut = new EmailValidatorAdapter();
        const isValid = sut.isValid('valid_email@gmail.com');
        expect(isValid).toBe(true);
    });
    test('should call validator with correct email', () => {
        const sut = new EmailValidatorAdapter();
        const isEmailSpy = jest.spyOn(validator, 'isEmail');
        sut.isValid('valid_email@email.com');
        expect(isEmailSpy).toHaveBeenCalledWith('valid_email@email.com');
    });
});
