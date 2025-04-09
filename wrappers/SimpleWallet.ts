import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SimpleWalletConfig = {};

export function simpleWalletConfigToCell(config: SimpleWalletConfig): Cell {
    return beginCell().endCell();
}

export class SimpleWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SimpleWallet(address);
    }

    static createFromConfig(config: SimpleWalletConfig, code: Cell, workchain = 0) {
        const data = simpleWalletConfigToCell(config);
        const init = { code, data };
        return new SimpleWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
