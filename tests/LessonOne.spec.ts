import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { LessonOne } from '../wrappers/LessonOne';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('LessonOne', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LessonOne');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let lessonOne: SandboxContract<LessonOne>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        lessonOne = blockchain.openContract(LessonOne.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await lessonOne.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lessonOne.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lessonOne are ready to use
    });
});
