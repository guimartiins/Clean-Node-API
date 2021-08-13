// eslint-disable-next-line max-classes-per-file
import {
    InvalidParamError,
    MissingParamError,
    ServerError,
} from '../../errors';
import { SignUpController } from './signup';
import {
    IEmailValidator,
    IAddAccount,
    IAddAccountModel,
    IAccountModel,
} from './signup-protocols';

interface ISutTypes {
    sut: SignUpController;
    emailValidatorStub: IEmailValidator;
    addAccountStub: IAddAccount;
}

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }
    return new EmailValidatorStub();
};

const makeAddAccount = (): IAddAccount => {
    class AddAccountStub implements IAddAccount {
        add(account: IAddAccountModel): IAccountModel {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email@email.com',
                password: 'valid_password',
            };
            return fakeAccount;
        }
    }
    return new AddAccountStub();
};

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const addAccountStub = makeAddAccount();
    const sut = new SignUpController(emailValidatorStub, addAccountStub);
    return {
        sut,
        emailValidatorStub,
        addAccountStub,
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
    test('should return 400 if password confirmation fails', () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'wrong_password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(
            new InvalidParamError('passwordConfirmation')
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
                passwordConfirmation: 'password',
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
                passwordConfirmation: 'password',
            },
        };
        sut.handle(httpRequest);
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should return 500 if an EmailValidator throws', () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error();
        });
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError());
    });

    test('should call AddAccount with correct values', () => {
        const { sut, addAccountStub } = makeSut();
        const addSpy = jest.spyOn(addAccountStub, 'add');
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };
        sut.handle(httpRequest);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'password',
        });
    });

    test('should return 500 if an AddAccount throws', () => {
        const { sut, addAccountStub } = makeSut();
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
            throw new Error();
        });
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError());
    });

    test('should return 200 if valid data is provided', () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };
        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(200);
        expect(httpResponse.body).toEqual({
            id: 'valid_id',
            name: 'valid_name',
            email: 'valid_email@email.com',
            password: 'valid_password',
        });
    });
});
