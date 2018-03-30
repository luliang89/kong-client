
import { Client, ClientOptions } from './client';
import { Auth, AuthOptions } from './auth';
import { HmacAuth, HmacAuthOptions } from './hmac-auth';

export interface CreateAuthOptions<T extends AuthOptions> {

    type: string

    args: T

}

export interface CreateClientOptions extends ClientOptions {

    auth: CreateAuthOptions<AuthOptions>

}

export function create(options: CreateClientOptions) {

    let auth: Auth;
    switch (options.auth.type) {
        case 'hmac':
            auth = new HmacAuth(options.auth.args as HmacAuthOptions);
            break;
    }

    if (!auth) {
        throw 'auth.type is unknown';
    }

    let opts = Object.assign({}, options);
    delete opts.auth;
    let client = new Client(opts, auth);
    return client;
}
