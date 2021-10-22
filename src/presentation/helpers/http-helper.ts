/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ServerError, UnauthorizedError } from '../errors';
import { IResponse } from '../protocols/http';

export const badRequest = (error: Error): IResponse => ({
    statusCode: 400,
    body: error,
});

export const unauthorized = (): IResponse => ({
    statusCode: 401,
    body: new UnauthorizedError(),
});

export const serverError = (error: Error): IResponse => ({
    statusCode: 500,
    body: new ServerError(error.stack),
});

export const ok = (data: any): IResponse => ({
    statusCode: 200,
    body: data,
});
