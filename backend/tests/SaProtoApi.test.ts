import { describe, it } from '@jest/globals';
import { getUserDetails } from '../src/Services/SaprotoApiService';

// const USER = 'PROTUBE_TEST_USER';

describe('Protube API test', () => {
    it('should be able to get login details', async () => {
        const user = await getUserDetails('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOWVhMjA3ZTQxMjgyNTdjZWQzZTIzNTkxZTUyZjNjMjY5MTJiYTgxMTZkYzk1OTIzNTM5NDMxOTFjMDRhNDA4OTRkY2ZjZGUwZDRjNGRlYmUiLCJpYXQiOjE2ODkxMDkzNzcuNjU5NTY5LCJuYmYiOjE2ODkxMDkzNzcuNjU5NTc0LCJleHAiOjE2ODk3MTQxNzcuNTk2MDQ1LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.KQB__d5kKgsI-wehKglrOhPsPzgV3-Rz-W4PiWXvHnrB9g7sLAD8GWNIVMSV_uKkIEST83gi_RH-yGCS02KaBdGjSHB7PfKyG6YlmY4Qg2il7EtYeiQYpZuFEs7TVTp_xmXgKEj6IMG_tC70YmKS8EoyY88WuQUfq_53nXia9jdEb5CRRBc63IYmhtpriVAhvnf-VZrkOqep3ri-kFchtPu0u7UcIB6Llw0HMDzzgv0sg6mFBH1VKU_OsheiiF6UxvcJQcS8eCnEKHYcTwkf-kRBvlc_EmC1cnOup39Y-7KPLoc0bpvYpCpF4PgJ07KLf8Kz1W9EhikF6TcY3C1Np0rnXazDbH4STpVnWX6EBUrjSdHidSBrSz7YLnbx486ewc7KNkiyiEVo_-2Dz1JOpg8RHnrZRlHuK1id12InDP2QsfUO9GtUTq8mKGxI-KoX5r4VRE6B5FR-XLxlXhb9uG5E1ISr1YlnGwdFo-ELMmPy4wZ7ErBvObjinr8iAOjtpzbhGAZCTfElsKaXiaF4_VSUuBk-oGsm26A-9PNvhdRyEzqju-BdJhjBCPG7KgGeX4VWFFUpGEmWmCeE8sFt_JPd2cCRydEshfI8h-gU-X3UnI3pj9YLYb6PcMUelEipWofcT2UDXrhymLgrYg5Hs7MMy8FXa4USH8oPz5t-Dzo');
        console.log(user);
    });
    // it('should ping docker', async () => {
    //     const pong = await docker.ping();
    //     expect(pong.toString()).toBe('OK');
    // });

    // it('should get the container id of the S.A. Proto Laravel container', async () => {
    //     const containerId = await getSaProtoLaravelContainerId();
    //     expect(typeof containerId).toBe('string');
    //     expect(containerId).toHaveLength(64);
    // });
});
