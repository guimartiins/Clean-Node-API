export interface IHasher {
    hash(password: string): Promise<string>;
}
