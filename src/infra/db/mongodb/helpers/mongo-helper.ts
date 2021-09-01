import { MongoClient } from 'mongodb';
import { disconnect } from 'process';

export const MongoHelper = {
    client: null as unknown as MongoClient,

    async connect(uri: string): Promise<void> {
        this.client = await MongoClient.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    },

    async disconnect() {
        await this.client.close();
    },
};
