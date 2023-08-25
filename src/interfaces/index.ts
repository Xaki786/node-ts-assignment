export interface IDataAccessObject<T> {
    findBySku(sku: string): Promise<T | unknown>;
    findAll(): Promise<T[]>
}


export interface IStockService {
    getCurrentStockLevel(sku: any): Promise<IResponseStock>;
}

export interface IStock {
    sku: string;
    stock: number;
}

export interface IResponseStock {
    sku: string;
    qty: number;
}

export interface ITransaction {
    sku: string;
    type: 'order' | 'refund';
    qty: number;
}
