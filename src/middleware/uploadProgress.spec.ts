import {expect, use} from '@esm-bundle/chai';
import chaiAsPromised from 'chai-as-promised';
import {HttpClient} from '../HttpClient';
import {uploadProgress} from './uploadProgress';

use(chaiAsPromised);

describe('uploadProgress()', () => {
	(uploadProgress.isSupported ? it : it.skip)('streams request body', async () => {
		const progressEvents: number[] = [];
		const onProgress = (loaded: number) => {
			progressEvents.push(loaded);
		};

		const httpClient = new HttpClient(
			[uploadProgress(onProgress)],
			{},
			async (request) => {
				const reader = request.body?.getReader();
				expect(reader).to.not.be.null;

				let result;
				do {
					result = await reader!.read();
				} while ( ! result.done);

				return new Response();
			},
		);

		const chunk = crypto.getRandomValues(new Uint8Array(4096));
		const blob = new Blob([chunk]);

		await expect(httpClient.sendRequest('https://example.test', {
			// @ts-expect-error does not yet have types in lib
			duplex: 'half',
			body: blob.stream().pipeThrough(new CompressionStream('gzip')),
			method: 'POST',
		})).to.be.fulfilled;

		expect(progressEvents).to.deep.equal([0, 10, 4119]);
	});
});
