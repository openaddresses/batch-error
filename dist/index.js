/**
 * @class
 */
export default class PublicError extends Error {
    status;
    safe;
    constructor(status, err, safe, print = true) {
        // Wrap postgres errors to ensure stack trace (line nums) are returned
        if (err && Object.hasOwn(err, 'severity'))
            err = new Error(err.message);
        super(err ? err.message : safe);
        if (print && ![400, 401, 402, 403, 404].includes(status))
            console.error(err ? err : 'Error: ' + safe);
        this.status = status;
        this.safe = safe;
    }
    static respond(err, res, messages = []) {
        if (!(err instanceof PublicError) && err instanceof Error && (Object.hasOwn(err, 'status') || Object.hasOwn(err, 'statusCode'))) {
            const serr = err;
            err = new PublicError(serr.status || serr.statusCode, serr);
        }
        if (err instanceof PublicError) {
            res.status(err.status).send({
                status: err.status,
                message: err.safe,
                messages
            });
            // Handle generic errors
        }
        else {
            console.error(err);
            res.status(500).send({
                status: 500,
                message: 'Internal Server Error',
                messages
            });
        }
    }
}
//# sourceMappingURL=index.js.map