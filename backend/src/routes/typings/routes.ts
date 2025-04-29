interface http_searchYoutube_Params {
    
}
interface http_addVideoToQueue_Params {
    
}
interface http_user_Params {
    
}
interface http_admin_admin_Params {
    
}
interface http_admin_prefix_admin_Params {
    
}
interface guest_logincallback_Params {
    
}
interface guest_user_Params {
    
}
export interface RouteParamsMap {
    'http.searchYoutube': http_searchYoutube_Params
    'http.addVideoToQueue': http_addVideoToQueue_Params
    'http.user': http_user_Params
    'http.admin.admin': http_admin_admin_Params
    'http.admin.prefix.admin': http_admin_prefix_admin_Params
    'guest.logincallback': guest_logincallback_Params
    'guest.user': guest_user_Params
}
export const urlMappings: Record<keyof RouteParamsMap, string> = {
    'http.searchYoutube': '/api/search',
    'http.addVideoToQueue': '/api/queue',
    'http.user': '/api/user',
    'http.admin.admin': '/api/admin',
    'http.admin.prefix.admin': '/api/test/admin2',
    'guest.logincallback': '/auth/login/callback',
    'guest.user': '/auth/user',
};

