import { Blockchain, internal, printTransactionFees, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, fromNano, toNano } from '@ton/core';
import { ForwardTon } from '../wrappers/ForwardTon';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe.skip('ForwardTon', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('ForwardTon');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let admin: SandboxContract<TreasuryContract>;
    let receiver: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let forwardTon: SandboxContract<ForwardTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        admin = await blockchain.treasury('admin');
        receiver = await blockchain.treasury('receiver');
        user = await blockchain.treasury('sender');

        forwardTon = blockchain.openContract(ForwardTon.createFromConfig({ admin: admin.address, receiver: receiver.address }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await forwardTon.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: forwardTon.address,
            deploy: true,
            success: true,
        });
    });

    it('should send funds', async () => {
        const userBalanceBefore = await user.getBalance();
        const receiverBalanceBefore = await receiver.getBalance();

        const resultMsg = await forwardTon.sendFunds(user.getSender(), toNano("1"));

        expect(resultMsg.transactions).toHaveTransaction({
            from: user.address,
            to: forwardTon.address,
            success: true,
            value: toNano("1"),
            op: 0x6f074817
        });

        expect(resultMsg.transactions).toHaveTransaction({
            from: forwardTon.address,
            to: receiver.address,
            success: true,
        });

        const userBalanceAfter = await user.getBalance();
        const receiverBalanceAfter = await receiver.getBalance();

        expect(userBalanceAfter).toBeLessThan(userBalanceBefore);
        expect(receiverBalanceAfter).toBeGreaterThan(receiverBalanceBefore);

        // printTransactionFees(resultMsg.transactions);
    });

    it('should throw error if not enough funds', async () => {

        const resultMsg = await forwardTon.sendFunds(user.getSender(), toNano("0.1"));

        expect(resultMsg.transactions).toHaveTransaction({
            from: user.address,
            to: forwardTon.address,
            success: false,
            exitCode: 100
        });

        expect(resultMsg.transactions).toHaveTransaction({
            from: forwardTon.address,
            to: user.address,
            success: true,
            inMessageBounced: true
        });

        // printTransactionFees(resultMsg.transactions);
    });

    it('admin lock & unlock', async () => {
        expect((await forwardTon.getAdmin()).toString()).toEqual(admin.address.toString());
        expect((await forwardTon.getReceiver()).toString()).toEqual(receiver.address.toString());

        expect(await forwardTon.getIsLocked()).toBeFalsy();

        const resultMsgLock = await forwardTon.sendLock(admin.getSender());

        expect(resultMsgLock.transactions).toHaveTransaction({
            from: admin.address,
            to: forwardTon.address,
            success: true,
            op: 0x878f9b0e
        });

        expect(await forwardTon.getIsLocked()).toBeTruthy();

        const resultMsgUnlockWrong = await forwardTon.sendUnlock(user.getSender());

        expect(resultMsgUnlockWrong.transactions).toHaveTransaction({
            from: user.address,
            to: forwardTon.address,
            success: false,
            op: 0x6ae4b0ef,
            exitCode: 101
        });

        const resultMsgFundsWhileLock = await forwardTon.sendFunds(user.getSender(), toNano("1"));

        expect(resultMsgFundsWhileLock.transactions).toHaveTransaction({
            from: user.address,
            to: forwardTon.address,
            success: false,
            op: 0x6f074817,
            exitCode: 99
        });

        const resultMsgUnlock = await forwardTon.sendUnlock(admin.getSender());

        expect(resultMsgUnlock.transactions).toHaveTransaction({
            from: admin.address,
            to: forwardTon.address,
            success: true,
            op: 0x6ae4b0ef,
        });

        const resultMsgFunds = await forwardTon.sendFunds(user.getSender(), toNano("1"));

        expect(resultMsgFunds.transactions).toHaveTransaction({
            from: user.address,
            to: forwardTon.address,
            success: true,
            op: 0x6f074817,
        });

        expect(await forwardTon.getIsLocked()).toBeFalsy();
    });
});
