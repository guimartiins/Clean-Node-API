import { IAddAccountRepository } from '../../../../data/protocols/db/add-account-repository';
import { ILoadAccountByEmailRepository } from '../../../../data/protocols/db/load-account-by-email-repository';
import { IAccountModel } from '../../../../domain/models/account';
import { IAddAccountModel } from '../../../../domain/usecases/add-account';
import { MongoHelper } from '../helpers/mongo-helper';

export class AccountMongoRepository
    implements IAddAccountRepository, ILoadAccountByEmailRepository
{
    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const accountCollection = await MongoHelper.getCollection('accounts');
        const result = await accountCollection.insertOne(accountData);
        const account = await accountCollection.findOne(result.insertedId);
        return MongoHelper.map(account);
    }

    async loadByEmail(email: string): Promise<IAccountModel> {
        const accountCollection = await MongoHelper.getCollection('accounts');
        const account = await accountCollection.findOne({ email });
        return (account as any) && MongoHelper.map(account);
    }
}
