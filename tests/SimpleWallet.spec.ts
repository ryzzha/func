import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SimpleWallet } from '../wrappers/SimpleWallet';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SimpleWallet', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SimpleWallet');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let simpleWallet: SandboxContract<SimpleWallet>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        simpleWallet = blockchain.openContract(SimpleWallet.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await simpleWallet.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: simpleWallet.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and simpleWallet are ready to use
    });
});
