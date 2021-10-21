import { ILogErrorRepository } from '../../data/protocols/log-error-repository';
import { IController, IRequest, IResponse } from '../../presentation/protocols';

export class LogControllerDecorator implements IController {
    private readonly controller: IController;
    private readonly logErrorRepository: ILogErrorRepository;
    constructor(
        controller: IController,
        logErrorRepository: ILogErrorRepository
    ) {
        this.controller = controller;
        this.logErrorRepository = logErrorRepository;
    }
    async handle(httpRequest: IRequest): Promise<IResponse> {
        const httpResponse = await this.controller.handle(httpRequest);
        if (httpResponse.statusCode === 500) {
            await this.logErrorRepository.logError(httpResponse.body.stack);
        }
        return httpResponse;
    }
}
