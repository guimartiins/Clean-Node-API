/* eslint-disable prettier/prettier */
import { IAuthentication } from '../../../domain/usecases/authentication';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { MissingParamError } from '../../errors/missing-param-error';
import { badRequest, serverError, unauthorized } from '../../helpers/http-helper';
import { IRequest, IResponse } from '../../protocols';
import { IController } from '../../protocols/controller';
import { IEmailValidator } from '../../protocols/email-validator';

export class LoginController implements IController {
    constructor(private emailValidator: IEmailValidator, private authentication: IAuthentication) { }
    async handle(httpRequest: IRequest): Promise<IResponse> {
        try {
            const { email, password } = httpRequest.body;
            const requiredFields = [
                'email',
                'password',
            ];
            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field));
                }
            }
            const isValid = this.emailValidator.isValid(email);

            if (!isValid) {
                return badRequest(new InvalidParamError('email'))
            }

            const accessToken = await this.authentication.auth(email, password);
            if (!accessToken) {
                return unauthorized();
            }
            return {
                statusCode: 200,
                body: {},
            };
        } catch (error) {
            return serverError(error)
        }
    }
}
