import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type TonReceiverConfig = {
    owner: Address;
};

export function tonReceiverConfigToCell(config: TonReceiverConfig): Cell {
    return beginCell().storeAddress(config.owner).endCell();
}

export class TonReceiver implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TonReceiver(address);
    }

    static createFromConfig(config: TonReceiverConfig, code: Cell, workchain = 0) {
        const data = tonReceiverConfigToCell(config);
        const init = { code, data };
        return new TonReceiver(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTon(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x1d9c7dcc, 32).endCell(),
        });
    }

    async sendWithdrawTon(provider: ContractProvider, via: Sender, amount: bigint) {
        await provider.internal(via, {
            value: toNano("0.1"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x37726bdb, 32).storeUint(amount, 64).endCell(),
        });
    }

    async getOwner(provider: ContractProvider): Promise<Address> {
        const res = (await provider.get("get_owner", [])).stack;
        return res.readAddress();
    }

    async getBalance(provider: ContractProvider): Promise<Number> {
        const res = (await provider.get("balance", [])).stack;
        return res.readNumber();
    }
}
