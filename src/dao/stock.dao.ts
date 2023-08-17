/** @format */

import { injectable } from 'inversify';
import { IDataAccessObject, IStock } from '../interfaces';
import fs from 'fs/promises';
import path from 'path';

@injectable()
export class StockDAO implements IDataAccessObject<IStock> {
    private readonly pathToFile = path.join(__dirname + "/", 'stock.json');

    async findAll(): Promise<IStock[]> {
        const rawData = await fs.readFile(this.pathToFile, 'utf-8');
        return JSON.parse(rawData);
    }

    async findBySku(sku: string): Promise<IStock | null> {
        try {
            const stocks = await this.findAll();
            return stocks.find((stock) => stock.sku === sku) || null;
        } catch (error) {
            throw new Error('Could not find stock');
        }
    }
}
