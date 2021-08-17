/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ServerError } from '../errors';
import { IResponse } from '../protocols/http';

export const badRequest = (error: Error): IResponse => ({
    statusCode: 400,
    body: error,
});

export const serverError = (): IResponse => ({
    statusCode: 500,
    body: new ServerError(),
});

export const ok = (data: any): IResponse => ({
    statusCode: 200,
    body: data,
});
