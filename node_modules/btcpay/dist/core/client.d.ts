import * as elliptic from 'elliptic';
import { GetInvoicesArgs, PairClientResponse } from '../models/client';
import { Invoice } from '../models/invoice';
import { Rate } from '../models/rate';
export declare class BTCPayClient {
    private host;
    private kp;
    private tokens;
    private clientId;
    private userAgent;
    private options;
    constructor(host: string, kp: elliptic.ec.KeyPair, tokens?: any);
    pair_client(code: string): Promise<PairClientResponse>;
    get_rates(currencyPairs: string[], storeID: string): Promise<Rate[]>;
    create_invoice(payload: {
        currency: string;
        price: string | number;
    }, token?: any): Promise<Invoice>;
    get_invoice(invoiceId: string, token?: any): Promise<Invoice>;
    get_invoices(params?: GetInvoicesArgs, token?: any): Promise<Invoice[]>;
    private create_signed_headers;
    private signed_get_request;
    private signed_post_request;
    private unsigned_request;
}
