import { SaprotoApiService } from '#Services/SaprotoApiService.js';
import { describe, it } from '@jest/globals';

describe('Protube API test', () => {
    it('Should throw a 401 using an invalid Bearer token', async () => {
        await expect(async function () {
            const service = new SaprotoApiService();
            return await service.getUserDetails();
        }).rejects
            .toThrow('Request failed with status code 401');
    });
});
