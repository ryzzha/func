import { toNano } from '@ton/core';
import { SimpleWallet } from '../wrappers/SimpleWallet';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleWallet = provider.open(SimpleWallet.createFromConfig({}, await compile('SimpleWallet')));

    await simpleWallet.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(simpleWallet.address);

    // run methods on `simpleWallet`
}
