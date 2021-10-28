import { InvalidParamError, MissingParamError } from '../../errors';
import { badRequest, serverError, ok } from '../../helpers/http-helper';
import {
    IController,
    IRequest,
    IResponse,
    IEmailValidator,
    IAddAccount,
    IValidation,
} from './signup-protocols';

export class SignUpController implements IController {
    private readonly emailValidator: IEmailValidator;
    private readonly addAccount: IAddAccount;
    private readonly validation: IValidation;
    constructor(
        emailValidator: IEmailValidator,
        addAccount: IAddAccount,
        validation: IValidation
    ) {
        this.emailValidator = emailValidator;
        this.addAccount = addAccount;
        this.validation = validation;
    }
    async handle(httpRequest: IRequest): Promise<IResponse> {
        try {
            const error = this.validation.validate(httpRequest.body);
            if (error) {
                return badRequest(error);
            }
            const { name, email, password } = httpRequest.body;
            const isValid = this.emailValidator.isValid(email);

            if (!isValid) {
                return badRequest(new InvalidParamError('email'));
            }
            const account = await this.addAccount.add({
                name,
                email,
                password,
            });
            return ok(account);
        } catch (error) {
            return serverError(error);
        }
    }
}
