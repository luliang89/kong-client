
import { Credential } from './credential';
import { Headers } from './headers';

export interface AuthOptions {

    credential: Credential

    [k: string]: any
}

export interface Auth {

    readonly options: AuthOptions

    digest(httpMethod: string, path: string, headers: Headers, body?: any): void;

}