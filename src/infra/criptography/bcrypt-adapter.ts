import bcrypt from 'bcrypt';

import { IEncrypter } from '../../data/protocols/encrypter';

export class BcryptAdapter implements IEncrypter {
    private readonly salt: number;
    constructor(salt: number) {
        this.salt = salt;
    }
    async encrypt(password: string): Promise<string> {
        await bcrypt.hash(password, this.salt);
        return 'null';
    }
}
