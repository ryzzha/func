import { toNano } from '@ton/core';
import { TonReceiver } from '../wrappers/TonReceiver';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonReceiver = provider.open(TonReceiver.createFromConfig({}, await compile('TonReceiver')));

    await tonReceiver.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonReceiver.address);

    // run methods on `tonReceiver`
}
