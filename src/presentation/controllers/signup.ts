import { MissingParamError } from '../errors/missing-param-error';
import { badRequest } from '../helpers/http-helper';
import { IRequest, IResponse } from '../protocols/http';

export class SignUpController {
    handle(httpRequest: IRequest): IResponse {
        const requiredFields = ['name', 'email', 'password'];
        for (const field of requiredFields) {
            if (!httpRequest.body[field]) {
                return badRequest(new MissingParamError(field));
            }
        }
        return {
            statusCode: 200,
            body: 'ok',
        };
    }
}
