import { MissingParamError } from '../errors/missing-param-error';
import { IRequest, IResponse } from '../protocols/http';

export class SignUpController {
    handle(httpRequest: IRequest): IResponse {
        if (!httpRequest.body.name) {
            return {
                statusCode: 400,
                body: new MissingParamError('name'),
            };
        }
        if (!httpRequest.body.email) {
            return {
                statusCode: 400,
                body: new MissingParamError('email'),
            };
        }
        return {
            statusCode: 200,
            body: 'ok',
        };
    }
}
