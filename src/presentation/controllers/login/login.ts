/* eslint-disable prettier/prettier */
import { InvalidParamError } from '../../errors/invalid-param-error';
import { MissingParamError } from '../../errors/missing-param-error';
import { badRequest } from '../../helpers/http-helper';
import { IRequest, IResponse } from '../../protocols';
import { IController } from '../../protocols/controller';
import { IEmailValidator } from '../../protocols/email-validator';

export class LoginController implements IController {
    constructor(private emailValidator: IEmailValidator) { }
    async handle(httpRequest: IRequest): Promise<IResponse> {
        if (!httpRequest.body.email) {
            return badRequest(new MissingParamError('email'));
        }
        if (!httpRequest.body.password) {
            return badRequest(new MissingParamError('password'));
        }
        const isValid = this.emailValidator.isValid(httpRequest.body.email);

        if (!isValid) {
            return badRequest(new InvalidParamError('email'))
        }
        return {
            statusCode: 200,
            body: {},
        };
    }
}
