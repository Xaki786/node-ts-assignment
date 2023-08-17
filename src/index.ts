/** @format */

import 'reflect-metadata';
import { container } from './config/inversify.config';
import { IStockService } from './interfaces';
import TYPES from './config/types';

const stockService = container.get<IStockService>(TYPES.StockService);

const main = async () => {
    try {
        const skuToCheck = 'MDH133414/85/14';
        const { qty, sku } = await stockService.getCurrentStockLevel(skuToCheck);
        console.log(`Current stock level for SKU ${sku}: ${qty}`);
    } catch (error) {
        console.error(error);
    }
};

main();
