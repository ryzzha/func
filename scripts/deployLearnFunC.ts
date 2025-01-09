import { toNano } from '@ton/core';
import { LearnFunC } from '../wrappers/LearnFunC';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const learnFunC = provider.open(LearnFunC.createFromConfig({}, await compile('LearnFunC')));

    await learnFunC.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(learnFunC.address);

    // run methods on `learnFunC`
}
