import { StatusCodes } from "http-status-codes";
import { HttpError } from "@map-colonies/error-express-handler";

export const HTTP_INTERNAL_SERVER_ERROR: HttpError = {
    message: 'internal server error',
    name: 'INTERNAL_SERVER_ERROR',
    status: StatusCodes.INTERNAL_SERVER_ERROR
}

export const HTTP_NOT_FOUND: HttpError = {
    message: 'record not found',
    name: 'NOT_FOUND',
    status: StatusCodes.NOT_FOUND
}

export const HTTP_DUPLICATE: HttpError = {
    message: 'duplicate record',
    name: 'DUPLICATE',
    status: StatusCodes.CONFLICT
}
