// eslint-disable-next-line max-classes-per-file
import { InvalidParamError, MissingParamError, ServerError } from '../errors';
import { IEmailValidator } from '../protocols';
import { SignUpController } from './signup';

interface ISutTypes {
    sut: SignUpController;
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

const makeEmailValidatorWithError = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            throw new Error();
        }
    }
    return new EmailValidatorStub();
};

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const sut = new SignUpController(emailValidatorStub);
    return {
        sut,
        emailValidatorStub,
    };
};

describe('SignUp Controller', () => {
    test('should return 400 if no name is provided', () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('name'));
    });
    test('should return 400 if no email is provided', () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('email'));
    });

    test('should return 400 if no password is provided', () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                passwordConfirmation: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('password'));
    });
    test('should return 400 if no password confirmation is provided', () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(
            new MissingParamError('passwordConfirmation')
        );
    });
    test('should return 400 if an invalid email is provided', () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'invalid_email@email.com',
                password: 'password',
                passwordConfirmation: 'passwordConfirmation',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new InvalidParamError('email'));
    });
    test('should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest
            .spyOn(emailValidatorStub, 'isValid')
            .mockReturnValueOnce(false);
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'passwordConfirmation',
            },
        };
        sut.handle(httpRequest);
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should return 500 if an EmailValidator throws', () => {
        const emailValidatorStub = makeEmailValidatorWithError();
        const sut = new SignUpController(emailValidatorStub);

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'passwordConfirmation',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError());
    });
});
