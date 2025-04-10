import { Blockchain, printTransactionFees, SandboxContract, TreasuryContract  } from '@ton/sandbox';
import { Cell, fromNano, toNano } from '@ton/core';
import { TonReceiver } from '../wrappers/TonReceiver';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';


describe('TonReceiver', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonReceiver');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let sender: SandboxContract<TreasuryContract>;
    let tonReceiver: SandboxContract<TonReceiver>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');

        tonReceiver = blockchain.openContract(TonReceiver.createFromConfig({ owner: owner.address }, code));

        deployer = await blockchain.treasury('deployer');
        sender = await blockchain.treasury('sender');

        const deployResult = await tonReceiver.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonReceiver.address,
            deploy: true,
            success: true,
        });
    });

    it('should can receive tons if more than 2 and can withdraw if owner', async () => {
        const contractBalanceBefore = await tonReceiver.getBalance();

        const sendResult = await tonReceiver.sendTon(sender.getSender(), toNano('5'));

        expect(sendResult.transactions).toHaveTransaction({
            from: sender.address,
            to: tonReceiver.address,
            success: true,
            op: 0x1d9c7dcc
        });

        const contractBalanceAfter = await tonReceiver.getBalance();

        expect(Number(contractBalanceAfter)).toBeGreaterThan(Number(contractBalanceBefore));

        const ownerBalanceBefore = await owner.getBalance();

        const withdrawResult = await tonReceiver.sendWithdrawTon(owner.getSender(), toNano('3'));

        expect(withdrawResult.transactions).toHaveTransaction({
            from: owner.address,
            to: tonReceiver.address,
            success: true,
            op: 0x37726bdb
        });

        expect(withdrawResult.transactions).toHaveTransaction({
            from: tonReceiver.address,
            to: owner.address,
            success: true,
            value: toNano('3')
        });

        const ownerBalanceAfter = await owner.getBalance();

        expect(Number(ownerBalanceAfter)).toBeGreaterThan(Number(ownerBalanceBefore));

        const withdrawResultFailed = await tonReceiver.sendWithdrawTon(owner.getSender(), toNano('10'));

        expect(withdrawResultFailed.transactions).toHaveTransaction({
            from: owner.address,
            to: tonReceiver.address,
            success: false,
            exitCode: 101 
        });

        const withdrawResultFail = await tonReceiver.sendWithdrawTon(sender.getSender(), toNano('1'));

        expect(withdrawResultFail.transactions).toHaveTransaction({
            from: sender.address,
            to: tonReceiver.address,
            success: false,
            exitCode: 100 
        });

        printTransactionFees(sendResult.transactions);
    });


    it('should send back tons if less than 2', async () => {
        const contractBalanceBefore = await tonReceiver.getBalance();

        const sendResult = await tonReceiver.sendTon(sender.getSender(), toNano('1'));

        expect(sendResult.transactions).toHaveTransaction({
            from: sender.address,
            to: tonReceiver.address,
            success: true,
            op: 0x1d9c7dcc,
        });

        printTransactionFees(sendResult.transactions);

        const contractBalanceAfter = await tonReceiver.getBalance();

        expect(Number(contractBalanceAfter)).toBeGreaterThanOrEqual(Number(contractBalanceBefore));
    });
});
