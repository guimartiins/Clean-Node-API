import bcrypt from 'bcrypt';

import { IHashComparer } from '../../data/protocols/criptography/hash-comparer';
import { IHasher } from '../../data/protocols/criptography/hasher';

export class BcryptAdapter implements IHasher, IHashComparer {
    private readonly salt: number;
    constructor(salt: number) {
        this.salt = salt;
    }

    async compare(value: string, hash: string): Promise<boolean> {
        const isValid = await bcrypt.compare(value, hash);
        return isValid;
    }

    async hash(password: string): Promise<string> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash;
    }
}
