import type {Middleware} from '../HttpClient';

export abstract class HttpError extends Error {
	public constructor(
		public readonly request: Request,
		public readonly response: Response,
	) {
		super(`HTTP ${response.status} ${response.statusText}`);
	}
}

export class ClientError extends HttpError {}
export class ServerError extends HttpError {}

export const handleHttpErrors = (): Middleware => async (request, next) => {
	const response = await next(request);

	if (response.status >= 500) {
		throw new ServerError(request, response);
	}

	if (response.status >= 400) {
		throw new ClientError(request, response);
	}

	return response;
};
