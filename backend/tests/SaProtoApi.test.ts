import { SaprotoApiService } from '#Services/SaprotoApiService.js';
import { describe, it } from '@jest/globals';

const PROTUBE_USERS = {
    admin: {
        admin: true,
        email: 'admin@protube.nl',
        password: 'ADMIN',
        calling_name: 'protube_admin'
    },
    user: {
        admin: false,
        email: 'user@protube.nl',
        password: 'USER',
        calling_name: 'protube_user'
    }
};

describe('Protube API test', () => {
    let userToken: string = '';
    let adminToken: string = '';

    it('Should throw a 401 using an invalid Bearer token', async () => {
        await expect(async function () {
            const service = new SaprotoApiService('invalid_token');
            return await service.getUserDetails();
        }).rejects
            .toThrow('Request failed with status code 401');
    });

    it('Checking if we can retrieve a token for an admin', async () => {
        const service = new SaprotoApiService();
        adminToken = await service.getAccessToken(PROTUBE_USERS.admin.email, PROTUBE_USERS.admin.password);
        expect(adminToken.length).toBeGreaterThan(40);
    });

    it('Checking if we can retrieve a token for a user', async () => {
        const service = new SaprotoApiService();
        userToken = await service.getAccessToken(PROTUBE_USERS.user.email, PROTUBE_USERS.user.password);
        expect(userToken.length).toBeGreaterThan(40);
    });

    it('Checking if we can retrieve the details of an admin', async () => {
        const service = new SaprotoApiService(adminToken);
        const user = await service.getUserDetails();

        expect(user.authenticated).toBe(true);

        // This is to satify typescript for the things below
        if (!user.authenticated) return false;

        expect(user.admin).toBe(PROTUBE_USERS.admin.admin);
        expect(user.name).toBe(PROTUBE_USERS.admin.calling_name);
        expect(user.id).toBeGreaterThan(1);
    });

    it('Checking if we can retrieve the details of a user', async () => {
        const service = new SaprotoApiService(userToken);
        const user = await service.getUserDetails();

        expect(user.authenticated).toBe(true);

        // This is to satify typescript for the things below
        if (!user.authenticated) return false;

        expect(user.admin).toBe(PROTUBE_USERS.user.admin);
        expect(user.name).toBe(PROTUBE_USERS.user.calling_name);
        expect(user.id).toBeGreaterThan(1);
    });
});
