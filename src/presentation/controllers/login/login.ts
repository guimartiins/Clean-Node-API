/* eslint-disable prettier/prettier */
import { badRequest, serverError, unauthorized, ok } from '../../helpers/http-helper';
import { IAuthentication, IRequest, IResponse, IController, IValidation } from './login-protocols';

export class LoginController implements IController {
    constructor(private readonly authentication: IAuthentication, private readonly validation: IValidation) { }
    async handle(httpRequest: IRequest): Promise<IResponse> {
        try {
            const error = this.validation.validate(httpRequest.body);
            if (error) {
                return badRequest(error);
            }
            const { email, password } = httpRequest.body;

            const accessToken = await this.authentication.auth(email, password);
            if (!accessToken) {
                return unauthorized();
            }
            return ok({ accessToken })
        } catch (error) {
            return serverError(error)
        }
    }
}
