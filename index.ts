import type { Response } from 'express';

interface StatusError extends Error {
    status?: number;
    statusCode?: number
    safe?: string;
}

/**
 * @class
 */
export default class PublicError extends Error {
    status: number;
    safe: string;

    constructor(
        status: number,
        err: Error | null | undefined,
        safe: string | undefined,
        print = true
    ) {
        // Wrap postgres errors to ensure stack trace (line nums) are returned
        if (err && Object.hasOwn(err, 'severity')) err = new Error(err.message);

        super(err ? err.message : safe);

        if (print && ![200, 400, 401, 402, 403, 404].includes(status)) console.error(err ? err : 'Error: ' + safe);

        this.status = status;
        this.safe = safe || 'Generic Error';

        this.name = 'PublicError';
        Error.captureStackTrace(this, this.constructor);
    }

    static respond(
        err: unknown,
        res: Response, messages: object[] = []
    ) {
        if (typeof err === 'object') {
            const serr = err as StatusError;

            const status = Object.hasOwn(serr, 'status') ? (!isNaN(Number(serr.status)) ? Number(serr.status) : 500 ) : 500;
            if (status === 500) {
                console.error(err);
            }

            if (!res.headersSent) {
                res.status(status).send({
                    status: status,
                    message: Object.hasOwn(serr, 'safe') ? serr.safe : 'Internal Server Error',
                    messages
                });
            } else {
                res.end();
            }
        } else {
            console.error(err);
            if (!res.headersSent) {
                res.status(500).send({
                    status: 500,
                    message: 'Internal Server Error',
                    messages
                });
            } else {
                res.end();
            }
        }
    }
}
