import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type ForwardTonConfig = {
    admin: Address;
    receiver: Address;
};

export function forwardTonConfigToCell(config: ForwardTonConfig): Cell {
    const { admin, receiver } = config;
    return beginCell().storeUint(0, 1).storeAddress(admin).storeAddress(receiver).endCell();
}

export class ForwardTon implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new ForwardTon(address);
    }

    static createFromConfig(config: ForwardTonConfig, code: Cell, workchain = 0) {
        const data = forwardTonConfigToCell(config);
        const init = { code, data };
        return new ForwardTon(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendFunds(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x6f074817, 32).endCell(),
        });
    }

    async sendLock(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: toNano("0.01"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x878f9b0e, 32).endCell(),
        });
    }

    async sendUnlock(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: toNano("0.01"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x6ae4b0ef, 32).endCell(),
        });
    }

    async getIsLocked(provider: ContractProvider,) {
        const res = (await provider.get("get_is_locked", [])).stack;
        return res.readNumber() == 0 ? false : true;
    }

    async getAdmin(provider: ContractProvider,) {
        const res = (await provider.get("get_admin", [])).stack;
        return res.readAddress();
    }

    async getReceiver(provider: ContractProvider,) {
        const res = (await provider.get("get_receiver", [])).stack;
        return res.readAddress();
    }
}
