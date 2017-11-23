export default class Transaction {
    private reactionRunner;
    stack: any[];
    changes: any[];
    constructor(reactionRunner: any);
    queueChanges(changes: any): void;
    start(): void;
    end(): void;
    reaction(): void;
}
