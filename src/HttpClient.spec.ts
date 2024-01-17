import {expect, use} from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import {HttpClient, Middleware} from './HttpClient';

use(chaiAsPromised);

describe('HttpClient', () => {
	describe('sendRequest()', () => {
		it('resolves to response', async () => {
			const httpClient = new HttpClient([], {credentials: 'omit'}, async (request: Request) => {
				expect(request.url).to.equal('https://example.com/test');
				expect(request.method).to.equal('POST');
				expect(request.credentials).to.equal('omit');

				return new Response(
					JSON.stringify({success: true}),
					{status: 201, headers: {'Content-Type': 'application/json'}},
				);
			});

			const response = await httpClient.sendRequest('https://example.com/test', {method: 'POST'});

			expect(response.status).to.equal(201);
			expect(response.headers.get('Content-Type')).to.equal('application/json');

			const payload = await response.json();
			expect(payload).to.deep.equal({success: true});
		});

		it('rejects with error', async () => {
			const httpClient = new HttpClient([], {credentials: 'omit'}, async (request: Request) => {
				expect(request.url).to.equal('https://example.com/test');
				expect(request.method).to.equal('POST');
				expect(request.credentials).to.equal('omit');

				throw new TypeError();
			});

			await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.be.rejectedWith(TypeError);
		});
	});

	describe('middlewares', () => {
		const middleware: Middleware = async (request, next) => {
			const headers = new Headers(request.headers);
			headers.set('X-Random-Header', '123');

			const response = await next(
				new Request(request, {headers}),
			);

			if (response.status === 401) {
				throw new Error('Not Authenticated :(');
			}

			return response;
		};

		it('global middlewares', async () => {
			const httpClient = new HttpClient([middleware], {}, async (request) => {
				expect(request.headers.has('X-Random-Header')).to.be.true;
				return new Response(null, {status: 401});
			});

			await expect(httpClient.sendRequest('https://example.com', {method: 'POST'})).to.be.rejectedWith(Error, 'Not Authenticated :(');
		});

		it('inline middlewares', async () => {
			const httpClient = new HttpClient([], {}, async (request) => {
				expect(request.headers.has('X-Random-Header')).to.be.true;
				return new Response(null, {status: 401});
			});

			await expect(httpClient.sendRequest('https://example.com', {method: 'POST'}, [middleware])).to.be.rejectedWith(Error, 'Not Authenticated :(');
		});
	});
});
