import type {Middleware} from '../HttpClient';

export const retry = (
	maxAttempts = 2,
	statusCodes = [502, 503, 504],
	delay = (attempt: number) => Math.min(0.3 * (2 ** (attempt - 1)) * 1000, 5000),
): Middleware => async (request, next) => {
	let attempt = 1, response: Response;

	do {
		response = await next(request.clone());

		if ( ! statusCodes.includes(response.status)) {
			return response;
		}

		attempt += 1;
		if (attempt > maxAttempts) {
			return response;
		}

		const delayMs = delay(attempt);
		await new Promise((resolve) => setTimeout(resolve, delayMs));

	} while ( ! response.ok);

	return response;
};
