// eslint-disable-next-line max-classes-per-file
import { InvalidParamError } from '../../errors';
import { IEmailValidator } from '../../protocols/email-validator';
import { EmailValidation } from './email-validation';

interface ISutTypes {
    sut: EmailValidation;
    emailValidatorStub: IEmailValidator;
}

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }
    return new EmailValidatorStub();
};

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const sut = new EmailValidation('email', emailValidatorStub);
    return {
        sut,
        emailValidatorStub,
    };
};

describe('Email Validation', () => {
    test('should return an error if EmailValidator returns false', () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest
            .spyOn(emailValidatorStub, 'isValid')
            .mockReturnValueOnce(false);
        const error = sut.validate({
            email: 'any_email@email.com',
        });
        expect(error).toEqual(new InvalidParamError('email'));
    });

    test('should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');
        sut.validate({
            email: 'any_email@email.com',
        });
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should throw if an EmailValidator throws', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error();
        });
        expect(sut.validate).toThrow();
    });
});
