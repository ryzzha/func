import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { LearnFunC } from '../wrappers/LearnFunC';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe.skip('LearnFunC', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LearnFunC');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let learnFunC: SandboxContract<LearnFunC>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        learnFunC = blockchain.openContract(LearnFunC.createFromConfig({ total: 0, operations_count: 0 }, code));


        deployer = await blockchain.treasury('deployer');

        const deployResult = await learnFunC.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: learnFunC.address,
            deploy: true,
            success: true,
        });
    });

    it('should increment number and operation amount', async () => {
        const totalBefore = await learnFunC.getTotal();

        const incrementResult = await learnFunC.sendIncrement(deployer.getSender(), 10, "increment");

        const totalAfter = await learnFunC.getTotal();

        expect(incrementResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: learnFunC.address,
            success: true,
        });

        console.log("totalBefore -> " + totalBefore);
        console.log("totalAfter -> " + totalAfter);
    });
});
