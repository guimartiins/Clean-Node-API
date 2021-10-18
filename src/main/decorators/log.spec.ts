import { IRequest, IResponse } from '../../presentation/protocols';
import { IController } from '../../presentation/protocols/controller';
import { LogControllerDecorator } from './log';

interface ISutTypes {
    sut: LogControllerDecorator;
    controllerStub: IController;
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

const makeSut = (): ISutTypes => {
    const controllerStub = makeController();
    const sut = new LogControllerDecorator(controllerStub);
    return { sut, controllerStub };
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
});
