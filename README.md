# @particular/http-client

A modern universal HTTP client based on Fetch API. Infinitely extensible via middlewares.

## Installation

```shell
npm install @particular/http-client
```

## Usage

```typescript
import { HttpClient } from '@particular/http-client';

const httpClient = new HttpClient();

const response = await httpClient.sendRequest('https://example.com', { method: 'POST' });
```

The `sendRequest` method has the same signature as the `fetch()` function: it accepts the same parameters, and returns a promise that resolves to a `Response` object.

## Middlewares

By itself, the `HttpClient` is just a trivial wrapper over the Fetch API. But it is powerful in _how_ it wraps the `fetch()` call: in a stack of middlewares.

A middleware is a function that receives the `request` along with a function reference to the `next` middleware in the stack, and is expected to return a promise resolving to a `Response`:

```typescript
type Middleware = (request: Request, next: (request: Request) => Promise<Response>) => Promise<Response>;
```

This design allows for infinite flexibility. A middleware implementation can freely choose when – if at all – to delegate to the next middleware in the stack, how to modify the incoming request before passing it on, or how to decorate the upstream response before returning it back.

### Configuration

Middlewares can be configured either globally for the `HttpClient` instance:

```typescript
const httpClient = new HttpClient([
	middleware1,
	middleware2,
]);
```

or on a per-request basis:

```typescript
const response = await httpClient.sendRequest(request, {}, [
	middleware3,
	middleware4,
]);
```

The two configuration methods can be used together. The resulting middleware stack is a simple concatenation of the global middlewares, and the per-request middlewares, in that order.

In the examples above, the middleware stack for `request` would be `[middleware1, middleware2, middleware3, middleware4]`.

### Bundled middlewares

This packages comes bundled with a couple of useful middlewares:

#### handleHttpErrors()

```typescript
import { handleHttpErrors, HttpClient } from '@particular/http-client';

const httpClient = new HttpClient([
	handleHttpErrors(),
]);
```

By default, Fetch API only rejects in case of network or similar errors, _not_ when the response comes with a non-ok status code. The `handleHttpErrors()` middleware ensures that the sendRequest call rejects non-ok responses with an `HttpError`:

```typescript
import { ClientError, ServerError } from '@particular/http-client';

try {
	const response = await httpClient.sendRequest(request);
} catch (error) {
	if (error instanceof ClientError) {
		// response code 4xx
		console.error(error.message, error.request, error.response);
	} else if (error instanceof ServerError) {
		// response code 5xx
		console.error(error.message, error.request, error.response)
    }
}
```

#### timeout()

```typescript
import { timeout } from '@particular/http-client';

const httpClient = new HttpClient([
	timeout(2_000 /* ms */),
]);
```

This middleware aborts the request if it does not resolve within the specified period (in milliseconds).

#### retry()

```typescript
import { retry } from '@particular/http-client';

const httpClient = new HttpClient([
	retry(),
]);
```

This middleware retries the request several times if the server responds with a specific status code. You can configure the status codes that trigger a new attempt, as well as the number of attempts and the delay between the attempts:

```typescript
import { retry } from '@particular/http-client';

const httpClient = new HttpClient([
	retry(
		3 /* maximum number of attempts, defaults to 2 */,
		[429, 502], /* status codes to retry, default to [502, 503, 504] */
		(attempt: number) => (attempt - 1) * 1000, /* delay between attempts, defaults to an exponential backoff */
	),
]);
```
