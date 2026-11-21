/** Documents ending in .pdf open in the site's own reader; anything else is a link out. */
export const isPdf = (url?: string | null): url is string => !!url && /\.pdf($|[?#])/i.test(url);
