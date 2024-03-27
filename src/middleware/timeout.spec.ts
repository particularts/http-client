import {expect, use} from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import {HttpClient} from '../HttpClient';
import {timeout} from './timeout';

use(chaiAsPromised);

describe('timeout()', () => {
	it('resolves in time', async () => {
		const httpClient = new HttpClient(
			[timeout(1000)],
			{},
			(request) => new Promise((resolve, reject) => {
				request.signal.onabort = () => reject(request.signal.reason);

				const response = new Response(null, {status: 200});
				globalThis.setTimeout(() => resolve(response), 500);
			}),
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.be.fulfilled;
	});

	it('rejects on timeout', async () => {
		const httpClient = new HttpClient(
			[timeout(500)],
			{},
			(request) => new Promise((resolve, reject) => {
				request.signal.onabort = () => reject(request.signal.reason);

				const response = new Response(null, {status: 200});
				globalThis.setTimeout(() => resolve(response), 1000);
			}),
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.be.rejectedWith(DOMException);
	});
});
