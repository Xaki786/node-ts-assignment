/** @format */

import 'reflect-metadata';
import { IDataAccessObject, IStock } from '../../interfaces';

import fs from 'fs/promises';
import TYPES from '../../config/types';
import { Container } from 'inversify';
import { StockDAO } from './stock.dao';

jest.mock('fs/promises');

describe('StockDAO', () => {
    let stockDAO: IDataAccessObject<IStock>;
    let container: Container;
    const mockData: IStock[] = [
        { sku: 'test-sku-1', stock: 1000 },
        { sku: 'test-sku-2', stock: 50 },
    ];

    beforeEach(() => {
        container = new Container();
        container.bind<IDataAccessObject<IStock>>(TYPES.StockDAO).to(StockDAO);
        stockDAO = container.get<IDataAccessObject<IStock>>(TYPES.StockDAO);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all stocks', async () => {
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
            const result = await stockDAO.findAll();
            expect(result).toEqual(mockData);
        });
    });

    describe('findBySku', () => {
        it('should return a stock with the given SKU', async () => {
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
            const skuToFind = 'test-sku-1';
            const result = await stockDAO.findBySku(skuToFind);
            expect(result).toEqual(mockData[0]);
        });

        it('should return null if no stock with the given SKU is found', async () => {
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
            const skuToFind = 'non-existent-sku';
            const result = await stockDAO.findBySku(skuToFind);
            expect(result).toBeNull();
        });

        it('should throw an error when reading file fails', async () => {
            (fs.readFile as jest.Mock).mockRejectedValue(new Error('File read error'));
            await expect(stockDAO.findBySku('test-sku-1')).rejects.toThrow('Could not find stock');
        });
    });
});
