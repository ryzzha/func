import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SimpleWallet } from '../wrappers/SimpleWallet';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { beginCell, safeSign, contractAddress } from '@ton/core';
import { getSecureRandomBytes, mnemonicToPrivateKey, mnemonicToWalletKey, KeyPair } from '@ton/crypto';

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

    it('do actions with wallet', async () => {
        // example from gpt ->

        /// 1. Параметри
        const seqno = 0;
        const validUntil = Math.floor(Date.now() / 1000) + 60; // +1 хвилина

        /// 2. Побудова внутрішнього slice (payload)
        const payload = beginCell()
        .storeUint(seqno, 32)
        .storeUint(validUntil, 32)
        // .storeUint(0x10, 8) // mode
        // .storeRef(...)     // повідомлення (опціонально)
        .endCell();

        /// 3. Підпис хешу
        const privateKey = "/* завантаж приватний ключ */";
        const hash = payload.hash();
        const signature = sign(hash, privateKey);

        /// 4. Створюємо зовнішнє повідомлення
        const message = beginCell()
        .storeBuffer(signature) // 512 біт = 64 байти
        .storeSlice(payload.asSlice())
        .endCell();

        /// 5. Надсилаємо (псевдокод)
        await client.sendExternalMessage(walletAddress, message);

        const mnemonics = "grape bird tissue ..."; // 24 слова
        const keyPair = await mnemonicToWalletKey(mnemonics.split(" "));
        const privateKey = keyPair.secretKey;


        const innerMsg = beginCell()
        .storeUint(0xf8a7ea5, 32) // op
        .storeUint(0, 64)         // query_id
        .storeCoins(toNano("0.1"))
        .storeAddress(receiver)
        .endCell();

        const payload = beginCell()
        .storeUint(seqno, 32)
        .storeUint(validUntil, 32)
        .storeUint(3, 8)           // mode
        .storeRef(beginCell()
            .storeUint(0, 2)         // flags for internal message
            .storeAddress(receiver)
            .storeCoins(toNano("0.1"))
            .storeRef(innerMsg)
            .endCell()
        )
        .endCell();
    });
});
