/* eslint-disable prettier/prettier */
import {
    IAuthentication,
    IAuthenticationModel,
} from '../../../domain/usecases/authentication';
import { IHashComparer } from '../../protocols/criptography/hash-comparer';
import { ILoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository';

export class DbAuthentication implements IAuthentication {
    constructor(
        private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository,
        private readonly hashComparer: IHashComparer
    ) { }

    async auth(authentication: IAuthenticationModel): Promise<string | null> {
        const account = await this.loadAccountByEmailRepository.load(authentication.email);
        if (account) {
            await this.hashComparer.compare(authentication.password, account?.password);
        }
        return null;
    }
}
