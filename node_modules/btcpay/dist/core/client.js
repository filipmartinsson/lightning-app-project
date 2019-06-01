"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qs = require("querystring");
const rp = require("request-promise");
const _ = require("underscore");
const cryptography_1 = require("./cryptography");
class BTCPayClient {
    constructor(host, kp, tokens = {}) {
        this.host = host;
        this.kp = kp;
        this.tokens = tokens;
        this.host = this.host.replace(/\/+$/, '');
        this.clientId = cryptography_1.Cryptography.get_sin_from_key(this.kp);
        this.userAgent = 'node-btcpay';
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': this.userAgent,
                'X-Accept-Version': '2.0.0',
            },
            json: true,
        };
    }
    async pair_client(code) {
        const re = new RegExp('^\\w{7}$');
        if (!re.test(code)) {
            throw new Error('pairing code is not valid');
        }
        const payload = {
            id: this.clientId,
            pairingCode: code,
        };
        return this.unsigned_request('/tokens', payload).then((data) => {
            const _data = data[0];
            const _res = {};
            _res[_data.facade] = _data.token;
            return _res;
        });
    }
    async get_rates(currencyPairs, storeID) {
        return this.signed_get_request('/rates', {
            currencyPairs: currencyPairs.join(','),
            storeID,
        });
    }
    async create_invoice(payload, token) {
        const re = new RegExp('^[A-Z]{3}$');
        if (!re.test(payload.currency)) {
            throw new Error('Currency is invalid');
        }
        if (isNaN(parseFloat(payload.price))) {
            throw new Error('Price must be a float');
        }
        return this.signed_post_request('/invoices', payload, token);
    }
    async get_invoice(invoiceId, token) {
        return this.signed_get_request('/invoices/' + invoiceId, token);
    }
    async get_invoices(params, token) {
        return this.signed_get_request('/invoices', params, token);
    }
    create_signed_headers(uri, payload) {
        return {
            'X-Identity': Buffer.from(this.kp.getPublic().encodeCompressed()).toString('hex'),
            'X-Signature': cryptography_1.Cryptography.sign(uri + payload, this.kp).toString('hex'),
        };
    }
    async signed_get_request(path, params = {}, token = _.values(this.tokens)[0]) {
        params.token = token;
        const _options = JSON.parse(JSON.stringify(this.options));
        const _uri = this.host + path;
        const _payload = '?' + qs.stringify(params);
        _.extend(_options.headers, this.create_signed_headers(_uri, _payload));
        _options.uri = _uri;
        _options.qs = params;
        return rp.get(_options).then((resp) => resp.data);
    }
    async signed_post_request(path, payload, token = _.values(this.tokens)[0]) {
        payload.token = token;
        const _uri = this.host + path;
        const _payload = JSON.stringify(payload);
        const _options = JSON.parse(JSON.stringify(this.options));
        _.extend(_options.headers, this.create_signed_headers(_uri, _payload));
        _options.uri = _uri;
        _options.body = payload;
        return rp.post(_options).then((resp) => resp.data);
    }
    async unsigned_request(path, payload) {
        const _mixin = {
            method: 'POST',
            uri: this.host + path,
            body: payload,
        };
        const _options = Object.assign({}, JSON.parse(JSON.stringify(this.options)), _mixin);
        return rp(_options).then((resp) => resp.data);
    }
}
exports.BTCPayClient = BTCPayClient;
