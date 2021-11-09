import { badRequest, serverError, ok } from '../../helpers/http/http-helper';
import {
    IController,
    IRequest,
    IResponse,
    IAddAccount,
    IValidation,
} from './signup-protocols';

export class SignUpController implements IController {
    constructor(
        private readonly addAccount: IAddAccount,
        private readonly validation: IValidation
    ) {}
    async handle(httpRequest: IRequest): Promise<IResponse> {
        try {
            const error = this.validation.validate(httpRequest.body);
            if (error) {
                return badRequest(error);
            }
            const { name, email, password } = httpRequest.body;

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
