import { MissingParamError, ServerError } from '../../errors';
import { ok, serverError, badRequest } from '../../helpers/http/http-helper';
import { IRequest } from '../../protocols/http';
// eslint-disable-next-line max-classes-per-file
import { SignUpController } from './signup';
import {
    IAddAccount,
    IAddAccountModel,
    IAccountModel,
    IValidation,
} from './signup-protocols';

interface ISutTypes {
    sut: SignUpController;
    addAccountStub: IAddAccount;
    validationStub: IValidation;
}

const makeFakeAccount = (): IAccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@email.com',
    password: 'valid_password',
});

const makeAddAccount = (): IAddAccount => {
    class AddAccountStub implements IAddAccount {
        async add(account: IAddAccountModel): Promise<IAccountModel> {
            return new Promise((resolve) => resolve(makeFakeAccount()));
        }
    }
    return new AddAccountStub();
};

const makeValidation = (): IValidation => {
    class ValidationStub implements IValidation {
        validate(input: any): Error | undefined {
            return undefined;
        }
    }
    return new ValidationStub();
};

const makeFakeRequest = (): IRequest => ({
    body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'password',
        passwordConfirmation: 'password',
    },
});

const makeSut = (): ISutTypes => {
    const addAccountStub = makeAddAccount();
    const validationStub = makeValidation();
    const sut = new SignUpController(addAccountStub, validationStub);
    return {
        sut,
        addAccountStub,
        validationStub,
    };
};

describe('SignUp Controller', () => {
    test('should call AddAccount with correct values', async () => {
        const { sut, addAccountStub } = makeSut();
        const addSpy = jest.spyOn(addAccountStub, 'add');
        await sut.handle(makeFakeRequest());
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'password',
        });
    });

    test('should return 500 if an AddAccount throws', async () => {
        const { sut, addAccountStub } = makeSut();
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
            return new Promise((resolve, reject) => reject(new Error()));
        });
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new ServerError('error')));
    });

    test('should return 200 if valid data is provided', async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
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
