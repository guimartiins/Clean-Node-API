import { IResponse } from '../protocols/http';

export const badRequest = (error: Error): IResponse => ({
    statusCode: 400,
    body: error,
});
