
import crypto = require('crypto');

import { Auth, AuthOptions } from '../auth';
import { Headers } from '../headers';

import { HmacAuthCredential } from './hmac-auth.credential';

export type HashType = 'sha1' | 'sha256' | 'sha384' | 'sha512';

export interface HmacAuthOptions extends AuthOptions {

    hashType?: HashType

    credential: HmacAuthCredential

    enforceHeaders?: string[]
}

export class HmacAuth implements Auth {

    get hash() {
        return this.options.hashType;
    }

    constructor(
        public readonly options: HmacAuthOptions
    ) {
        if (!options.hashType) {
            options.hashType = 'sha256';
        }
    }

    digest(httpMethod: string, path: string, headers: Headers, body?: string): void {

        if (body) {
            let signature = this.createHash().update(body).digest('base64');
            headers['Digest'] = 'SHA-' + this.hash.substr(this.hash.search(/\d/)) + '=' + signature;
        }

        let enforceHeaders = this.options.enforceHeaders;

        if (!enforceHeaders || enforceHeaders.length === 0) {
            return;
        }

        let arr = new Array<string>();

        for (let key of enforceHeaders) {
            if (key === 'request-line') {
                arr.push(this.getRequestLine(httpMethod, path));
            } else {
                arr.push(`${key.toLowerCase()}: ${headers[key]}`);
            }
        }

        let signature = this.createHmac().update(arr.join('\n')).digest('base64');
        //console.log(arr.join('\n'));

        headers['Authorization'] = `hmac username="${this.options.credential.username}", algorithm="hmac-${this.hash}", headers="${enforceHeaders.join(' ').toLowerCase()}", signature="${signature}"`;

    }

    private getRequestLine(httpMethod: string, path: string) {
        let idx = path.indexOf('?');
        if (idx > -1) {
            path = path.substring(0, idx)
        }
        return `${httpMethod} ${path} HTTP/1.1`;
    }

    private createHmac() {
        return crypto.createHmac(this.hash, this.options.credential.secret);
    }

    private createHash() {
        return crypto.createHash(this.hash);
    }

}