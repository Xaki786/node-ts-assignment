/** @format */

import 'reflect-metadata';
import { IDataAccessObject, ITransaction } from '../../interfaces';
import { Container } from 'inversify';
import fs from 'fs/promises';
import TYPES from '../../config/types';
import { TransactionDAO } from './transaction.dao';

jest.mock('fs/promises');

describe('TransactionDAO', () => {
    let transactionDAO: IDataAccessObject<ITransaction>;
    let container: Container;
    const mockData: ITransaction[] = [
        { sku: 'trans-sku-1', type: 'order', qty: 20 },
        { sku: 'trans-sku-2', type: 'refund', qty: 10 },
    ];

    beforeEach(() => {
      container = new Container();
      container
          .bind<IDataAccessObject<ITransaction>>(TYPES.TransactionDAO)
          .to(TransactionDAO);
      transactionDAO = container.get<IDataAccessObject<ITransaction>>(
          TYPES.TransactionDAO
      );
  });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all transactions', async () => {
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
            const result = await transactionDAO.findAll();
            expect(result).toEqual(mockData);
        });
    });

    describe('findBySku', () => {
        it('should return transactions with the given SKU', async () => {
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
            const skuToFind = 'trans-sku-1';
            const result = await transactionDAO.findBySku(skuToFind);
            expect(result).toEqual([mockData[0]]);
        });

      it('should return an empty array if no transactions with the given SKU are found', async () => {
          (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
          const skuToFind = 'non-existent-sku';
          const result = await transactionDAO.findBySku(skuToFind);
          expect(result).toEqual([]);
      });

      it('should throw an error when reading file fails', async () => {
          (fs.readFile as jest.Mock).mockRejectedValue(
              new Error('File read error')
          );
          await expect(transactionDAO.findBySku('trans-sku-1')).rejects.toThrow(
              'File read error'
          );
      });
  });
});
