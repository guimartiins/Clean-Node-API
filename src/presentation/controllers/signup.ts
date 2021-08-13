import { InvalidParamError, MissingParamError } from '../errors';
import { badRequest, serverError } from '../helpers/http-helper';
import { IController } from '../protocols/controller';
import { IEmailValidator } from '../protocols/email-validator';
import { IRequest, IResponse } from '../protocols/http';

export class SignUpController implements IController {
    private readonly emailValidator: IEmailValidator;
    constructor(emailValidator: IEmailValidator) {
        this.emailValidator = emailValidator;
    }
    handle(httpRequest: IRequest): IResponse {
        try {
            const requiredFields = [
                'name',
                'email',
                'password',
                'passwordConfirmation',
            ];
            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field));
                }
            }
            const isValid = this.emailValidator.isValid(httpRequest.body.email);

            if (!isValid) {
                return badRequest(new InvalidParamError('email'));
            }
            return {
                statusCode: 200,
                body: 'ok',
            };
        } catch (e) {
            return serverError();
        }
    }
}
