import axios, { type AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8080/api/protube/userdetails';

async function Get (route: string, accessToken: string): Promise<AxiosResponse> {
    return await axios.get(`${BASE_URL}`, {
        headers: {
            Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOWVhMjA3ZTQxMjgyNTdjZWQzZTIzNTkxZTUyZjNjMjY5MTJiYTgxMTZkYzk1OTIzNTM5NDMxOTFjMDRhNDA4OTRkY2ZjZGUwZDRjNGRlYmUiLCJpYXQiOjE2ODkxMDkzNzcuNjU5NTY5LCJuYmYiOjE2ODkxMDkzNzcuNjU5NTc0LCJleHAiOjE2ODk3MTQxNzcuNTk2MDQ1LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.KQB__d5kKgsI-wehKglrOhPsPzgV3-Rz-W4PiWXvHnrB9g7sLAD8GWNIVMSV_uKkIEST83gi_RH-yGCS02KaBdGjSHB7PfKyG6YlmY4Qg2il7EtYeiQYpZuFEs7TVTp_xmXgKEj6IMG_tC70YmKS8EoyY88WuQUfq_53nXia9jdEb5CRRBc63IYmhtpriVAhvnf-VZrkOqep3ri-kFchtPu0u7UcIB6Llw0HMDzzgv0sg6mFBH1VKU_OsheiiF6UxvcJQcS8eCnEKHYcTwkf-kRBvlc_EmC1cnOup39Y-7KPLoc0bpvYpCpF4PgJ07KLf8Kz1W9EhikF6TcY3C1Np0rnXazDbH4STpVnWX6EBUrjSdHidSBrSz7YLnbx486ewc7KNkiyiEVo_-2Dz1JOpg8RHnrZRlHuK1id12InDP2QsfUO9GtUTq8mKGxI-KoX5r4VRE6B5FR-XLxlXhb9uG5E1ISr1YlnGwdFo-ELMmPy4wZ7ErBvObjinr8iAOjtpzbhGAZCTfElsKaXiaF4_VSUuBk-oGsm26A-9PNvhdRyEzqju-BdJhjBCPG7KgGeX4VWFFUpGEmWmCeE8sFt_JPd2cCRydEshfI8h-gU-X3UnI3pj9YLYb6PcMUelEipWofcT2UDXrhymLgrYg5Hs7MMy8FXa4USH8oPz5t-Dzo'
        }
    });
}

interface UserData {
    id: number
    name: string
    admin: boolean
}

export async function getUserDetails (accessToken: string): Promise<UserData> {
    const response = await Get('userdetails', accessToken);
    console.log(response.data);
    return response.data as UserData;
}
