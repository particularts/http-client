import type {Middleware} from '../HttpClient';

export const uploadProgress = (
	onProgress: (loaded: number) => void,
): Middleware => async (request, next) => {
	if ( ! uploadProgress.isSupported) {
		return next(request);
	}

	const {body, signal} = request;
	if (body === null) {
		return next(request);
	}

	let loaded = 0;
	const {readable, writable} = new TransformStream<Uint8Array, Uint8Array>({
		transform(chunk, controller) {
			onProgress(loaded);

			loaded += chunk.byteLength;
			controller.enqueue(chunk);
		},
		flush() {
			onProgress(loaded);
		},
	});

	body.pipeTo(writable, {signal});

	const decoratedRequest = new Request(request, {
		// @ts-expect-error does not yet have types in lib
		duplex: 'half',
		body: readable,
	});

	return next(decoratedRequest);
};

uploadProgress.isSupported = (() => {
	let duplexAccessed = false;

	const hasContentType = new Request('https://example.com', {
		body: new ReadableStream(),
		method: 'POST',
		// @ts-expect-error does not yet have types in lib
		get duplex() {
			duplexAccessed = true;
			return 'half';
		},
	}).headers.has('Content-Type');

	return duplexAccessed && !hasContentType;
})();
