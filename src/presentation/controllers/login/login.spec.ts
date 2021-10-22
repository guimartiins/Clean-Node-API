import { InvalidParamError } from '../../errors/invalid-param-error';
import { MissingParamError } from '../../errors/missing-param-error';
import { badRequest, serverError } from '../../helpers/http-helper';
import { IRequest } from '../../protocols/http';
import { IEmailValidator } from '../signup/signup-protocols';
import { LoginController } from './login';

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    return new EmailValidatorStub();
};

const makeFakeRequest = (): IRequest => ({
    body: {
        email: 'any_email@email.com',
        password: 'any_password',
    },
});

interface ISutTypes {
    sut: LoginController;
    emailValidatorStub: IEmailValidator;
}

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const sut = new LoginController(emailValidatorStub);
    return {
        sut,
        emailValidatorStub,
    };
};

describe('Login Controller', () => {
    test('should return 400 if no email is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                password: 'any_password',
            },
        };
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('email'))
        );
    });

    test('should return 400 if no password is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
            },
        };
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('password'))
        );
    });

    test('should call EmailValidator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');
        await sut.handle(makeFakeRequest());
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should return 400 if an invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(
            badRequest(new InvalidParamError('email'))
        );
    });

    test('should returns 500 if EmailValidator throws', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error();
        });
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new Error()));
    });
});
