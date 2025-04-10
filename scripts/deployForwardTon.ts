import { toNano } from '@ton/core';
import { ForwardTon } from '../wrappers/ForwardTon';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const forwardTon = provider.open(ForwardTon.createFromConfig({}, await compile('ForwardTon')));

    await forwardTon.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(forwardTon.address);

    // run methods on `forwardTon`
}
