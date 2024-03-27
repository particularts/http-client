import {expect, use} from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import {HttpClient} from '../HttpClient';
import {ClientError, handleHttpErrors, ServerError} from './handleHttpErrors';

use(chaiAsPromised);

describe('handleHttpErrors()', () => {
	it('resolves to response', async () => {
		const httpClient = new HttpClient(
			[handleHttpErrors()],
			{},
			async () => new Response(null, {status: 204}),
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.be.fulfilled;
	});

	it('rejects with ClientError', async () => {
		const httpClient = new HttpClient(
			[handleHttpErrors()],
			{},
			async () => new Response(null, {status: 404}),
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.be.rejectedWith(ClientError);
	});

	it('rejects with ServerError', async () => {
		const httpClient = new HttpClient(
			[handleHttpErrors()],
			{},
			async () => new Response(null, {status: 503}),
		);

		await expect(httpClient.sendRequest('https://example.com/test', {method: 'POST'})).to.be.rejectedWith(ServerError);
	});
});
