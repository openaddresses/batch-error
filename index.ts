import { Response } from 'express';

interface StatusError extends Error {
    status?: number;
    statusCode?: number
}

/**
 * @class
 */
export default class PublicError extends Error {
    status: number;
    safe: string;

    constructor(status: number, err?: Error | null, safe?: string, print = true) {
        // Wrap postgres errors to ensure stack trace (line nums) are returned
        if (err && Object.hasOwn(err, 'severity')) err = new Error(err.message);

        super(err ? err.message : safe);

        if (print && ![400, 401, 402, 403, 404].includes(status)) console.error(err ? err : 'Error: ' + safe);

        this.status = status;
        this.safe = safe;
    }

    static respond(err: unknown, res: Response, messages: object[] = []) {
        if (!(err instanceof PublicError) && err instanceof Error && (Object.hasOwn(err, 'status') || Object.hasOwn(err, 'statusCode'))) {
            const serr = err as StatusError;
            err = new PublicError(serr.status || serr.statusCode, serr);
        }

        if (err instanceof PublicError) {
            res.status(err.status).send({
                status: err.status,
                message: err.safe,
                messages
            });
        // Handle generic errors
        } else {
            console.error(err);

            res.status(500).send({
                status: 500,
                message: 'Internal Server Error',
                messages
            });
        }
    }
}
