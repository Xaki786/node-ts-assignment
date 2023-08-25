import "reflect-metadata";
import { Container } from "inversify";
import { StockService } from '../services/stock.service';
import { StockDAO } from '../dao/stock/stock.dao';
import { TransactionDAO } from '../dao/transaction/transaction.dao';
import { IDataAccessObject, IStockService, IStock, ITransaction } from '../interfaces';
import TYPES from "./types";


const container = new Container();
container.bind<IDataAccessObject<IStock>>(TYPES.StockDAO).to(StockDAO);
container.bind<IDataAccessObject<ITransaction>>(TYPES.TransactionDAO).to(TransactionDAO);
container.bind<IStockService>(TYPES.StockService).to(StockService);


export { container };
