import { ServerError } from '../errors/server-error';
import { IResponse } from '../protocols/http';

export const badRequest = (error: Error): IResponse => ({
    statusCode: 400,
    body: error,
});

export const serverError = (): IResponse => ({
    statusCode: 500,
    body: new ServerError(),
});
