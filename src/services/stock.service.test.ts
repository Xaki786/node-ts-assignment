/** @format */

import 'reflect-metadata';
import {
    IDataAccessObject,
    IStockService,
    IStock,
    ITransaction,
} from '../interfaces';
import { Container } from 'inversify';
import TYPES from '../config/types';
import { StockService } from './stock.service';

jest.mock('../dao/stock/stock.dao');
jest.mock('../dao/transaction/transaction.dao');

describe('StockService', () => {
    let stockService: IStockService;
    let mockStockDao: IDataAccessObject<IStock>;
    let mockTransactionDao: IDataAccessObject<ITransaction>;

    beforeEach(() => {
        const container = new Container();
        mockStockDao = {
            findAll: jest.fn(),
            findBySku: jest.fn(),
        };

        mockTransactionDao = {
            findAll: jest.fn(),
            findBySku: jest.fn(),
        };


        container.bind<IStockService>(TYPES.StockService).to(StockService);
        container
            .bind<IDataAccessObject<IStock>>(TYPES.StockDAO)
            .toConstantValue(mockStockDao);
        container
            .bind<IDataAccessObject<ITransaction>>(TYPES.TransactionDAO)
            .toConstantValue(mockTransactionDao);

        stockService = container.get<IStockService>(TYPES.StockService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('getCurrentStockLevel', () => {
        it('should calculate stock level based on stock and transactions', async () => {
            const sku = 'test-sku';
            (mockStockDao.findBySku as jest.Mock).mockResolvedValue({
                sku,
                stock: 10,
            });
            (mockTransactionDao.findBySku as jest.Mock).mockResolvedValue([
                { sku, type: 'order', qty: 3 },
                { sku, type: 'refund', qty: 1 },
            ]);

            const result = await stockService.getCurrentStockLevel(sku);
            expect(result).toEqual({ sku, qty: 8 });
        });


        it('should return stock level when there are no transactions', async () => {
            const sku = 'test-sku';
            (mockStockDao.findBySku as jest.Mock).mockResolvedValue({ sku, stock: 10 });
            (mockTransactionDao.findBySku as jest.Mock).mockResolvedValue([]);

            const result = await stockService.getCurrentStockLevel(sku);
            expect(result).toEqual({ sku, qty: 10 });
        });

        it('should consider transactions even if stock doesn’t exist', async () => {
            const sku = 'test-sku';
            (mockStockDao.findBySku as jest.Mock).mockResolvedValue(null);
            (mockTransactionDao.findBySku as jest.Mock).mockResolvedValue([
                { sku, type: 'order', qty: 3 },
            ]);

            const result = await stockService.getCurrentStockLevel(sku);
            expect(result).toEqual({ sku, qty: -3 });
        });

        it('should handle mixed transactions correctly', async () => {
            const sku = 'test-sku';
            (mockStockDao.findBySku as jest.Mock).mockResolvedValue({ sku, stock: 10 });
            (mockTransactionDao.findBySku as jest.Mock).mockResolvedValue([
                { sku, type: 'order', qty: 2 },
                { sku, type: 'refund', qty: 1 },
                { sku, type: 'order', qty: 4 }
            ]);

            const result = await stockService.getCurrentStockLevel(sku);
            expect(result).toEqual({ sku, qty: 5 });
        });

        it('should throw error if stock not found and no transactions', async () => {
            const sku = 'test-sku';
            (mockStockDao.findBySku as jest.Mock).mockResolvedValue(null);
            (mockTransactionDao.findBySku as jest.Mock).mockResolvedValue([]);

            await expect(stockService.getCurrentStockLevel(sku)).rejects.toThrow(
                'Stock not found'
            );
        });


        it('should throw error if stockDao encounters an error', async () => {
            const sku = 'test-sku';
            const error = new Error('StockDAO Error');
            (mockStockDao.findBySku as jest.Mock).mockRejectedValue(error);

            await expect(stockService.getCurrentStockLevel(sku)).rejects.toThrow(
                error
            );
        });

        it('should throw error if transactionDao encounters an error', async () => {
            const sku = 'test-sku';
            const error = new Error('TransactionDAO Error');
            (mockStockDao.findBySku as jest.Mock).mockResolvedValue({
                sku,
                stock: 10,
            });
            (mockTransactionDao.findBySku as jest.Mock).mockRejectedValue(error);

            await expect(stockService.getCurrentStockLevel(sku)).rejects.toThrow(
                error
            );
        });


    });
});
