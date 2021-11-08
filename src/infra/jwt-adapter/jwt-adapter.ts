import jwt from 'jsonwebtoken';

import { IEncrypter } from '../../data/protocols/criptography/encrypter';

export class JwtAdapter implements IEncrypter {
    constructor(private readonly secret: string) {}
    async encrypt(value: string): Promise<string> {
        await jwt.sign({ id: value }, this.secret);
        return 'abuble';
    }
}
