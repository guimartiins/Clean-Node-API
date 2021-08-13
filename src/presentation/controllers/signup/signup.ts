import { InvalidParamError, MissingParamError } from '../../errors';
import { badRequest, serverError } from '../../helpers/http-helper';
import {
    IController,
    IRequest,
    IResponse,
    IEmailValidator,
    IAddAccount,
} from './signup-protocols';

export class SignUpController implements IController {
    private readonly emailValidator: IEmailValidator;
    private readonly addAccount: IAddAccount;
    constructor(emailValidator: IEmailValidator, addAccount: IAddAccount) {
        this.emailValidator = emailValidator;
        this.addAccount = addAccount;
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
            const { name, email, password, passwordConfirmation } =
                httpRequest.body;
            if (password !== passwordConfirmation) {
                return badRequest(
                    new InvalidParamError('passwordConfirmation')
                );
            }
            const isValid = this.emailValidator.isValid(email);

            if (!isValid) {
                return badRequest(new InvalidParamError('email'));
            }
            this.addAccount.add({
                name,
                email,
                password,
            });
            return {
                statusCode: 200,
                body: 'ok',
            };
        } catch (e) {
            return serverError();
        }
    }
}
