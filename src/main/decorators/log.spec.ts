import { ILogErrorRepository } from '../../data/protocols/log-error-repository';
import { serverError } from '../../presentation/helpers/http-helper';
import { IRequest, IResponse } from '../../presentation/protocols';
import { IController } from '../../presentation/protocols/controller';
import { LogControllerDecorator } from './log';

interface ISutTypes {
    sut: LogControllerDecorator;
    controllerStub: IController;
    logErrorRepositoryStub: ILogErrorRepository;
}

const makeController = (): IController => {
    class ControllerStub implements IController {
        handle(httpRequest: IRequest): Promise<IResponse> {
            const httpResponse: IResponse = {
                statusCode: 200,
                body: {
                    name: 'test',
                },
            };
            return new Promise((resolve) => resolve(httpResponse));
        }
    }

    return new ControllerStub();
};

const makeLogErrorRepository = (): ILogErrorRepository => {
    class LogErrorRepositoryStub implements ILogErrorRepository {
        async log(stack: string): Promise<void> {
            return new Promise((resolve) => resolve());
        }
    }
    return new LogErrorRepositoryStub();
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
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            },
        };
        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });

    test('should return the same result of controller', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            },
        };
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual({
            statusCode: 200,
            body: {
                name: 'test',
            },
        });
    });

    test('should call LogErrorRepository with correct error if controller returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const fakeError = new Error();
        fakeError.stack = 'any_stack';
        const error = serverError(fakeError);
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'log');
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(
            new Promise((resolve) => resolve(error))
        );
        const httpRequest = {
            body: {
                email: 'any_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            },
        };
        await sut.handle(httpRequest);
        expect(logSpy).toHaveBeenCalledWith('any_stack');
    });
});
