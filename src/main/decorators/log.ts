import { IController, IRequest, IResponse } from '../../presentation/protocols';

export class LogControllerDecorator implements IController {
    private readonly controller: IController;
    constructor(controller: IController) {
        this.controller = controller;
    }
    async handle(httpRequest: IRequest): Promise<IResponse> {
        await this.controller.handle(httpRequest);
        return {
            statusCode: 200,
            body: null,
        };
    }
}
