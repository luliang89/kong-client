
import { Credential } from '../credential';

export interface HmacAuthCredential extends Credential {

    username: string

    secret: string

}