import { IRequest, IResponse } from './http';

export interface IController {
    handle(httpRequest: IRequest): IResponse;
}
