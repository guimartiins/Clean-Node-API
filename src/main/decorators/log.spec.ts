import { ILogErrorRepository } from '../../data/protocols/log-error-repository';
import { IAccountModel } from '../../domain/models/account';
import { serverError, ok } from '../../presentation/helpers/http/http-helper';
import { IRequest, IResponse } from '../../presentation/protocols';
import { IController } from '../../presentation/protocols/controller';
import { LogControllerDecorator } from './log';

interface ISutTypes {
    sut: LogControllerDecorator;
    controllerStub: IController;
    logErrorRepositoryStub: ILogErrorRepository;
}

const makeFakeAccount = (): IAccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@email.com',
    password: 'valid_password',
});

const makeController = (): IController => {
    class ControllerStub implements IController {
        handle(httpRequest: IRequest): Promise<IResponse> {
            return new Promise((resolve) => resolve(ok(makeFakeAccount())));
        }
    }

    return new ControllerStub();
};

const makeLogErrorRepository = (): ILogErrorRepository => {
    class LogErrorRepositoryStub implements ILogErrorRepository {
        async logError(stack: string): Promise<void> {
            return new Promise((resolve) => resolve());
        }
    }
    return new LogErrorRepositoryStub();
};

const makeFakeRequest = (): IRequest => ({
    body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'password',
        passwordConfirmation: 'password',
    },
});

const makeFakeServerError = (): IResponse => {
    const fakeError = new Error();
    fakeError.stack = 'any_stack';
    return serverError(fakeError);
};

const makeSut = (): ISutTypes => {
    const controllerStub = makeController();
    const logErrorRepositoryStub = makeLogErrorRepository();
    const sut = new LogControllerDecorator(
        controllerStub,
        logErrorRepositoryStub
    );
    return { sut, controllerStub, logErrorRepositoryStub };
};

describe('LogController Decorator', () => {
    test('should call controller handle', async () => {
        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, 'handle');
        await sut.handle(makeFakeRequest());
        expect(handleSpy).toHaveBeenCalledWith(makeFakeRequest());
    });

    test('should return the same result of controller', async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    });

    test('should call LogErrorRepository with correct error if controller returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError');
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(
            new Promise((resolve) => resolve(makeFakeServerError()))
        );
        await sut.handle(makeFakeRequest());
        expect(logSpy).toHaveBeenCalledWith('any_stack');
    });
});
