import { type RouteParamsMap, urlMappings } from '@routes/typings/route-typings';

type RouteTag = keyof RouteParamsMap;

/**
 * Create a URL path from a route name and parameters
 *
 * @param tag - The name of the route
 * @param {object} [params] - Route parameters to be replaced in the URL
 * @returns An URL path
 */
export default function route<T extends RouteTag> (...args: keyof RouteParamsMap[T] extends undefined
    ? [tag: T]
    : [tag: T, params: RouteParamsMap[T]]): string {
    const [tag, params] = args;
    const route = {
        tag,
        params: params ?? {},
        url: urlMappings[tag] // Get the associated URL from the mapping
    };

    for (const [param, value] of Object.entries(route.params)) {
        const dynamicSegmentRegex = new RegExp(`:${param}(\\([^\\)]+\\))?\\??`, 'g');
        route.url = route.url.replace(dynamicSegmentRegex, (value as number | string).toString());
    }

    route.url = route.url.replace(/\/:\w+\?$/, '');

    return route.url;
}
