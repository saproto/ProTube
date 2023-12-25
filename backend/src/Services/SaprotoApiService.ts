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
            baseURL: c.saproto_site.api_host + '/api/protube',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    /**
     * Make a request to the saproto api and assert the response, catch errors for logging
     *
     * @param makeRequest Your request you'd like to make
     * @throws Errors from the request
     * @returns the response.data of the request
     */
    async #assertResponse (makeRequest: () => Promise<AxiosResponse<any, any>>): Promise<AxiosResponse<any, any>['data']> {
        try {
            const response = await makeRequest();
            return response.data;
        } catch (error: AxiosError | any) {
            if (axios.isAxiosError(error)) {
                // do Logging here e.g., status code checking
                // console.log(error.toJSON());
                throw error;
            } else {
                throw error;
            }
        }
    }

    /**
     * Get request wrapper
     *
     * @param route A url to which to make the post request
     * @param params The params for the get request
     * @returns The response data
     */
    async #get (route: url, params?: AxiosRequestConfig['params']): Promise<AxiosResponse<any, any>> {
        return await this.#axios.get(route, { params });
    }

    /**
     * Post request wrapper
     *
     * @param route A url to which to make the post request
     * @param data The body data for the post request
     * @returns The response data
     */
    async #post (route: url, data: any): Promise<AxiosResponse<any, any>> {
        return await this.#axios.post(route, data);
    }

    /**
     * Get an access token for the saproto laravel api for a user
     * This is used for testing purposes only
     *
     * @param username An email of a user
     * @param password A password of a user
     * @returns an access token for the api
     */
    async getAccessToken (username: string, password: string): Promise<string> {
        this.#axios.defaults.baseURL = c.saproto_site.api_host;

        const response = await this.#assertResponse(async () => {
            return await this.#post('/oauth/token', {
                grant_type: 'password',
                client_id: c.oauth.id,
                client_secret: c.oauth.secret,
                username,
                password
            });
        });

        return response.access_token;
    }

    /**
     * Get the details of the user
     *
     * @returns The details of the user
     */
    async getUserDetails (): Promise<User> {
        return await this.#assertResponse(async () => {
            return await this.#get('/userdetails');
        });
    }
}
