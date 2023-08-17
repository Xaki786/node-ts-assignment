import { inject, injectable } from 'inversify';
import { IDataAccessObject, IStockService, IStock, ITransaction, IResponseStock } from '../interfaces';
import TYPES from '../config/types';

@injectable()
export class StockService implements IStockService {
  constructor(
    @inject(TYPES.StockDAO) private stockDao: IDataAccessObject<IStock>,
    @inject(TYPES.TransactionDAO) private transactionDao: IDataAccessObject<ITransaction>
  ) { }

  async getCurrentStockLevel(sku: string): Promise<IResponseStock> {
    const stock = await this.stockDao.findBySku(sku) as IStock;
    if (stock instanceof Error) {
      throw stock;
    }

    const responseStock: IResponseStock = {
      sku: sku,
      qty: stock?.stock || 0
    }
    const transactions = await this.transactionDao.findBySku(sku) as ITransaction[];
    if (transactions instanceof Error) {
      throw transactions;
    }

    if (transactions && transactions.length === 0 && !stock) {
      throw new Error("Stock not found");

    }

    for (let transaction of transactions) {
      if (transaction.type === 'order') {
        responseStock.qty -= transaction.qty
      } else if (transaction.type === 'refund') {
        responseStock.qty += transaction.qty
      }

    }

    return responseStock;
  }
}
