export type Middleware = (request: Request, next: (request: Request) => Promise<Response>) => Promise<Response>;

export class HttpClient {
	public constructor(
		public readonly middlewares: Middleware[] = [],
		public readonly defaultOptions: RequestInit = {},
		private readonly fetch: (request: Request) => Promise<Response> = globalThis.fetch,
	) {}

	public async sendRequest(url: RequestInfo | URL, options: RequestInit = {}, middlewares: Middleware[] = []): Promise<Response> {
		const request = new Request(url, {...this.defaultOptions, ...options});

		const allMiddlewares = [...this.middlewares, ...middlewares];
		const getHandler = (index: number): ((request: Request) => Promise<Response>) => {
			const middleware = allMiddlewares[index];
			if (middleware === undefined) {
				return this.fetch;
			}

			const next = getHandler(index + 1);
			return (request: Request) => middleware(request, next);
		};

		const handler = getHandler(0);
		return handler(request);
	}
}
