import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type LearnFunConfig = {
    total: number,
    operations_count: number;
};

export function learnFunConfigToCell(config: LearnFunConfig): Cell {
    const { total, operations_count } = config;
    return beginCell().storeUint(total,64).storeUint(operations_count,32).endCell();
}

export class LearnFunC implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new LearnFunC(address);
    }

    static createFromConfig(config: LearnFunConfig, code: Cell, workchain = 0) {
        const data = learnFunConfigToCell(config);
        const init = { code, data };
        console.log("createFromConfig work")
        console.log(init)
        return new LearnFunC(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        console.log("sendDeploy work")
        console.log(this.init)
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrement(provider: ContractProvider, via: Sender, amount: number, operation: "increment" | "decrement") {
        const action = operation == "increment" ? 1 : 0;
        await provider.internal(via, {
            value: toNano("0.01"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0,32).storeUint(action,32).storeUint(amount,32).endCell(),
        });
    }

    async sendClearStorage(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: toNano("0.01"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(12345,32).endCell(),
        });
    }

    async getTotal(provider: ContractProvider) {
        const { stack } = await provider.get("get_total", []);
        return stack.readNumber()
    }

    async getOperationCount(provider: ContractProvider) {
        const { stack } = await provider.get("get_operations_count", []);
        return stack.readNumber()
    }
}
