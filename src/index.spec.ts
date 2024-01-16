import {expect} from '@esm-bundle/chai';
import {hello} from './index';

describe('hello', () => {
	it('works', () => {
		expect(hello()).to.equal('Hello, world!');
	});
});
