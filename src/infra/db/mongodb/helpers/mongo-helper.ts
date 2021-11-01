/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MongoClient, Collection } from 'mongodb';

export const MongoHelper = {
    client: null as unknown as MongoClient,
    uri: null as unknown as string,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async connect(uri: string): Promise<void> {
        this.uri = uri;
        this.client = await MongoClient.connect(uri);
    },

    async disconnect(): Promise<void> {
        await this.client.close();
        this.client = null as any;
    },

    async getCollection(name: string): Promise<Collection> {
        if (this.client === null) {
            await this.connect(this.uri);
        }
        return this.client.db().collection(name);
    },

    map(collection: any): any {
        const { _id, ...collectionWithoutId } = collection as any;
        return { ...collectionWithoutId, id: _id };
    },
};
