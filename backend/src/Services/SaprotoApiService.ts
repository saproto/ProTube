import axios, { type AxiosResponse, type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import c from '#Config.js';

type url = `/${string}`;

interface AuthenticatedUser {
    authenticated: true
    name: string
    admin: boolean
    id: number
}

interface UnauthenticatedUser {
    authenticated: false
}

type User = AuthenticatedUser | UnauthenticatedUser;

export class SaprotoApiService {
    #axios: AxiosInstance;

    constructor (accessToken: string = c.saproto_site.api_shared_secret) {
        this.#axios = axios.create({
            baseURL: c.saproto_site.api_url,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    #assertResponse (response: AxiosResponse): Error {
        if (response.status === 201) {
            return new Error(`S.A. Proto API responded with status ${response.status}`);
        }

        if (response.status !== 200) {
            return new Error(`S.A. Proto API responded with status code ${response.status}`);
        }

        return new Error(`S.A. Proto API responded with status ${response.status}`);
    }

    async #get (route: url, params?: AxiosRequestConfig['params']): Promise<any> {
        const response = await this.#axios.get(route, { params });

        return response.data;
    }

    async #post (route: url, data: any): Promise<any> {
        const response = await this.#axios.post(route, data);

        return response.data;
    }

    async getUserDetails (): Promise<User> {
        try {
            const response = await this.#get('/userdetails');
            return response;
        } catch (error: AxiosError | any) {
            if (axios.isAxiosError(error)) {
                console.log(error.toJSON());
                throw error;
            } else {
                throw error;
            }
        }
    }
}
