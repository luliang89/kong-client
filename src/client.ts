
import http = require('http');
import https = require('https');
import querystring = require('querystring');

import { Auth } from './auth';
import { Credential } from './credential';
import { Headers } from './headers';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PUT' | 'OPTIONS' | 'HEAD' | 'PATCH';

export interface ClientOptions {

    host: string

    port?: number

    ssl?: boolean

    /** 
     * 虚拟路径
    */
    path?: string

    validteBody?: boolean

    /** 
     * 全局的
     */
    headers?: any

}

export class Client {

    public readonly options: ClientOptions;

    constructor(
        options: ClientOptions | string,
        public auth: Auth
    ) {
        if (typeof options === 'string') {
            this.options = {
                host: options
            };
        } else {
            this.options = options;
        }
    }

    async request<T>(httpMethod: HttpMethod, path: string, query?: Object, headers?: Headers, body?: any) {

        headers = headers || {};
        if (this.options.headers) {
            headers = Object.assign(headers, this.options.headers);
        }
        headers.Date = new Date().toUTCString();

        if (body) {
            if (typeof body === 'object') {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(body);
            } else {
                headers['Content-Type'] = 'text/plain';
                body = String(body);
            }
        }

        if (this.options.path) {
            path = this.options.path + path;
        }

        this.auth.digest(httpMethod, path, headers, this.options.validteBody ? body : null);

        if (query) {
            path = (path.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(query);
        }

        let options = {
            host: this.options.host,
            port: this.options.port,
            method: httpMethod,
            path: path,
            headers: headers
        };

        let res = await this.httpRequest<T>(options, body, this.options.ssl);
        return res;
    }

    private async httpRequest<T>(options: http.RequestOptions, body?: string, ssl?: boolean) {

        var request = ssl ? https.request : http.request;

        console.log('kong-client', 'request', options.method, options.path, body);

        return new Promise<{
            status: number,
            data: T
        }>((resolve, reject) => {
            let req = request(options, res => {
                var datas = new Array<string>();
                res.on('error', err => reject(err))
                    .on('data', data => datas.push(data as string))
                    .on('end', () => {
                        let result: any = {
                            status: res.statusCode
                        };
                        let data = datas.join().trim();
                        //console.log(res.statusCode, data);
                        //if (data[0] === '{' || data[0] === '[') {
                        if (res.headers['content-type'].search('json') > -1) {
                            result.data = JSON.parse(data);
                        } else {
                            result.data = data;
                        }
                        console.log('kong-client', 'response', options.path, result);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(result);
                        } else {
                            reject(result);
                        }
                    });
            });
            if (body) {
                req.write(body);
            }
            req.on('error', function (err) {
                console.log('kong-client', 'error', options.path, err);
                reject(err);
            });
            req.end();
        });
    }

    async get<T>(path: string, query?: Object, headers?: Headers) {
        return this.request<T>('GET', path, query, headers);
    }

    async post<T>(path: string, body?: any, query?: Object, headers?: Headers) {
        return this.request<T>('POST', path, query, headers, body);
    }

    async put<T>(path: string, body?: any, query?: Object, headers?: Headers) {
        return this.request<T>('PUT', path, query, headers, body);
    }

    async delete<T>(path: string, query?: Object, headers?: Headers, body?: any) {
        return this.request<T>('DELETE', path, query, headers, body);
    }


}