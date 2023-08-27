import { RouteParamsMap, RouteTag } from 'routeHelper-types';

type RouteTag = keyof RouteParamsMap;

interface Route {
    tag: RouteTag;
    params: RouteParamsMap[RouteTag];
    url: string; // Include the URL in the Route interface
}

export default function route<T extends RouteTag>(tag: T, params?: RouteParamsMap[T]): string {
    const route = {
        tag,
        params: params || {},
        url: urlMappings[tag], // Get the associated URL from the mapping
    };

    for (const [param, value] of Object.entries(route.params)) {
        const dynamicSegmentRegex = new RegExp(`:${param}(\\([^\\)]+\\))?\\??`, 'g');
        route.url = route.url.replace(dynamicSegmentRegex, (value as number | string).toString());
    }

    route.url = route.url.replace(/\/:\w+\?$/, '');

    return route.url;
}
