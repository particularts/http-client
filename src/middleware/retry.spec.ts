import {expect, use} from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import {HttpClient} from '../HttpClient';
import {retry} from './retry';

use(chaiAsPromised);

describe('retry()', () => {
	it('retries on failure', async () => {
		let attempt = 1;
		const httpClient = new HttpClient(
			[retry()],
			{},
			async () => {
				const status = attempt++ > 1 ? 200 : 503;
				return new Response(null, {status});
			},
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.eventually
			.be.instanceof(Response)
			.and.have.property('status', 200);
	});

	it('gives up on too many failures', async () => {
		let attempt = 1;
		const httpClient = new HttpClient(
			[retry()],
			{},
			async () => {
				const status = attempt++ > 2 ? 200 : 503;
				return new Response(null, {status});
			},
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.eventually
			.be.instanceof(Response)
			.and.have.property('status', 503);
	});
});
