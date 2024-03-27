import type {Middleware} from '../HttpClient';

export const timeout = (timeoutMs: number): Middleware => async (request, next) => {
	// todo replace this with AbortSignal.any() once it lands in all browsers
	const controller = new AbortController();
	const timeoutSignal = AbortSignal.timeout(timeoutMs);
	timeoutSignal.addEventListener('abort', () => controller.abort(timeoutSignal.reason));
	request.signal.addEventListener('abort', () => controller.abort(request.signal.reason));

	return next(new Request(request, {signal: controller.signal}));
};
