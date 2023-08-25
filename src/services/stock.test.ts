/** @format */

import { container } from "../config/inversify.config";
import TYPES from "../config/types";
import { IStockService } from "../interfaces";

describe('StockService', () => {
    let stockService: IStockService;
    beforeEach(() => {
        stockService = container.get<IStockService>(TYPES.StockService);
    })
    test("Test", async () => {
        const skuToCheck = 'MDH133414/85/14';
        const { qty, sku } = await stockService.getCurrentStockLevel(skuToCheck);
        expect({ sku, qty }).toEqual({ sku: 'MDH133414/85/14', qty: 7268 });
    })
});
