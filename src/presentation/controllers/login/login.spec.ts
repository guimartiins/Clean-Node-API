import { MissingParamError } from '../../errors/missing-param-error';
import { badRequest } from '../../helpers/http-helper';
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
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                password: 'any_password',
            },
        };
        await sut.handle(httpRequest);
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });
});
