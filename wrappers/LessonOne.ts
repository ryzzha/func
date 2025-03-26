import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type LessonOneConfig = {};

export function lessonOneConfigToCell(config: LessonOneConfig): Cell {
    return beginCell().endCell();
}

export class LessonOne implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new LessonOne(address);
    }

    static createFromConfig(config: LessonOneConfig, code: Cell, workchain = 0) {
        const data = lessonOneConfigToCell(config);
        const init = { code, data };
        return new LessonOne(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
