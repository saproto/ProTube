interface http_all_Params {
    
}
interface http_create_test_Params {
    
}
interface http_create_test2_Params {
    
}
interface http_create_test3_Params {
    id: string | number
}
export interface RouteParamsMap {
    'http.all': http_all_Params
    'http.create.test': http_create_test_Params
    'http.create.test2': http_create_test2_Params
    'http.create.test3': http_create_test3_Params
}
export const urlMappings: Record<keyof RouteParamsMap, string> = {
    'http.all': '',
    'http.create.test': '/new',
    'http.create.test2': '/post',
    'http.create.test3': '/post/:id',
};

namespace http {
export type all = {
    /** The id of the user */
    id: number;
    /** The name of the user */
    name: string;
    /** Whether the user is an admin or not */
    admin: boolean;
    /** The date the user was created */
    createdAt: Date;
}[];
namespace create {
export type test = {};
export type test2 = {
    name: string;
};
export type test3 = {
    name: string;
};
}
}
namespace api {
}
