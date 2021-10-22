import { MissingParamError } from '../../errors/missing-param-error';
import { badRequest } from '../../helpers/http-helper';
import { IRequest, IResponse } from '../../protocols';
import { IController } from '../../protocols/controller';

export class LoginController implements IController {
    async handle(httpRequest: IRequest): Promise<IResponse> {
        return badRequest(new MissingParamError('email'));
    }
}
