/** @format */

import { injectable } from 'inversify';
import { IDataAccessObject, ITransaction } from '../interfaces';
import fs from 'fs/promises';
import path from 'path';

@injectable()
export class TransactionDAO implements IDataAccessObject<ITransaction> {
    private readonly pathToFile = path.join(__dirname + "/", 'transactions.json');

    async findAll(): Promise<ITransaction[]> {
        const rawData = await fs.readFile(this.pathToFile, 'utf-8');
        const parsed = JSON.parse(rawData);
        return parsed;
    }

    async findBySku(sku: string): Promise<ITransaction[]> {
        try {
            const transactions = await this.findAll();
            return transactions.filter((transaction) => transaction.sku === sku);
        } catch (error) {
            throw error;
        }
    }
}
