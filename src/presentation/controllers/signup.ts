import { MissingParamError } from '../errors/missing-param-error';
import { badRequest } from '../helpers/http-helper';
import { IRequest, IResponse } from '../protocols/http';

export class SignUpController {
    handle(httpRequest: IRequest): IResponse {
        if (!httpRequest.body.name) {
            return badRequest(new MissingParamError('name'));
        }
        if (!httpRequest.body.email) {
            return badRequest(new MissingParamError('email'));
        }
        return {
            statusCode: 200,
            body: 'ok',
        };
    }
}
