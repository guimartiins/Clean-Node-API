import {
    IAccountModel,
    IEncrypter,
    IAddAccount,
    IAddAccountModel,
    IAddAccountRepository,
} from './db-add-account-protocols';

export class DbAddAccount implements IAddAccount {
    private readonly encrypter: IEncrypter;
    private readonly addAccountRepository: IAddAccountRepository;
    constructor(
        encrypter: IEncrypter,
        addAccountRepository: IAddAccountRepository
    ) {
        this.encrypter = encrypter;
        this.addAccountRepository = addAccountRepository;
    }
    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const hashedPassword = await this.encrypter.encrypt(
            accountData.password
        );

        this.addAccountRepository.add({
            ...accountData,
            password: hashedPassword,
        });
        return new Promise((resolve) =>
            resolve({
                id: 'id',
                name: 'name',
                email: 'email',
                password: 'password',
            })
        );
    }
}
