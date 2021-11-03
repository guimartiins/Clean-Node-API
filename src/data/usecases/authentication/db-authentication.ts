/* eslint-disable prettier/prettier */
import {
    IAuthentication,
    IAuthenticationModel,
} from '../../../domain/usecases/authentication';
import { ILoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository';

export class DbAuthentication implements IAuthentication {
    constructor(
        private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository
    ) { }

    async auth(authentication: IAuthenticationModel): Promise<string | null> {
        await this.loadAccountByEmailRepository.load(authentication.email);
        return null;
    }
}
