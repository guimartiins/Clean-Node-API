/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';

import { IController, IRequest } from '../../../presentation/protocols';

export const adaptRoute = (controller: IController) => {
    return async (req: Request, res: Response) => {
        const httpRequest: IRequest = {
            body: req.body,
        };
        const httpResponse = await controller.handle(httpRequest);
        if (httpResponse.statusCode === 200) {
            res.status(httpResponse.statusCode).json(httpResponse.body);
        } else {
            res.status(httpResponse.statusCode).json({
                error: httpResponse.body.message,
            });
        }
    };
};
