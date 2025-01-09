import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { LearnFunC } from '../wrappers/LearnFunC';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('LearnFunC', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LearnFunC');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let learnFunC: SandboxContract<LearnFunC>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        learnFunC = blockchain.openContract(LearnFunC.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await learnFunC.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: learnFunC.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and learnFunC are ready to use
    });
});
