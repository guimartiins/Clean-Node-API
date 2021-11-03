/* eslint-disable prettier/prettier */
import {
    IAuthentication,
    IAuthenticationModel,
} from '../../../domain/usecases/authentication';
import { IHashComparer } from '../../protocols/criptography/hash-comparer';
import { ITokenGenerator } from '../../protocols/criptography/token-generator';
import { ILoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository';

export class DbAuthentication implements IAuthentication {
    constructor(
        private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository,
        private readonly hashComparer: IHashComparer,
        private readonly tokenGenerator: ITokenGenerator
    ) { }

    async auth(authentication: IAuthenticationModel): Promise<string | null> {
        const account = await this.loadAccountByEmailRepository.load(authentication.email);
        if (account) {
            const isValid = await this.hashComparer.compare(authentication.password, account?.password);
            if (isValid) {
                const accessToken = await this.tokenGenerator.generate(account?.id);
                return accessToken;
            }
        }
        return null;
    }
}
