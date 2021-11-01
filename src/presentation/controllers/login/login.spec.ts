import { MissingParamError } from '../../errors';
import {
    badRequest,
    serverError,
    unauthorized,
    ok,
} from '../../helpers/http-helper';
import { LoginController } from './login';
import { IRequest, IAuthentication, IValidation } from './login-protocols';

const makeAuthentication = (): IAuthentication => {
    class AuthenticationStub implements IAuthentication {
        async auth(email: string, password: string): Promise<string> {
            return 'any_token';
        }
    }

    return new AuthenticationStub();
};

const makeFakeRequest = (): IRequest => ({
    body: {
        email: 'any_email@email.com',
        password: 'any_password',
    },
});

const makeValidation = (): IValidation => {
    class ValidationStub implements IValidation {
        validate(input: any): Error | undefined {
            return undefined;
        }
    }
    return new ValidationStub();
};

interface ISutTypes {
    sut: LoginController;
    authenticationStub: IAuthentication;
    validationStub: IValidation;
}

const makeSut = (): ISutTypes => {
    const authenticationStub = makeAuthentication();
    const validationStub = makeValidation();
    const sut = new LoginController(authenticationStub, validationStub);
    return {
        sut,
        authenticationStub,
        validationStub,
    };
};

describe('Login Controller', () => {
    test('should call Authentication with correct values', async () => {
        const { sut, authenticationStub } = makeSut();
        const authSpy = jest.spyOn(authenticationStub, 'auth');
        await sut.handle(makeFakeRequest());
        expect(authSpy).toHaveBeenCalledWith(
            'any_email@email.com',
            'any_password'
        );
    });

    test('should returns 401 if invalid credentials are provided', async () => {
        const { sut, authenticationStub } = makeSut();
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(
            new Promise((resolve) => resolve(null))
        );
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(unauthorized());
    });

    test('should returns 500 if Authentication throws', async () => {
        const { sut, authenticationStub } = makeSut();
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new Error()));
    });

    test('should returns 200 if valid credentials are provided', async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(
            ok({
                accessToken: 'any_token',
            })
        );
    });

    test('should call Validation with correct value', async () => {
        const { sut, validationStub } = makeSut();
        const validateSpy = jest.spyOn(validationStub, 'validate');
        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);
        expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
    });

    test('should return 400 if validation returns an error', async () => {
        const { sut, validationStub } = makeSut();
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(
            new MissingParamError('any_field')
        );
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('any_field'))
        );
    });
});
