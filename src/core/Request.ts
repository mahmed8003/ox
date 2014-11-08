/// <reference path="../OX" />

module OX {


    export interface Request {


        /**
         * Return request header.
         *
         * The `Referrer` header field is special-cased,
         * both `Referrer` and `Referer` are interchangeable.
         *
         * Examples:
         *
         *     req.get('Content-Type');
         *     // => "text/plain"
         *
         *     req.get('content-type');
         *     // => "text/plain"
         *
         *     req.get('Something');
         *     // => undefined
         *
         * Aliased as `req.header()`.
         *
         * @param name
         */
        get (name:string): string;

        header(name:string): string;

        headers: { [key: string]: string; };

        /**
         * Check if the given `type(s)` is acceptable, returning
         * the best match when true, otherwise `undefined`, in which
         * case you should respond with 406 "Not Acceptable".
         *
         * The `type` value may be a single mime type string
         * such as "application/json", the extension name
         * such as "json", a comma-delimted list such as "json, html, text/plain",
         * or an array `["json", "html", "text/plain"]`. When a list
         * or array is given the _best_ match, if any is returned.
         *
         * Examples:
         *
         *     // Accept: text/html
         *     req.accepts('html');
         *     // => "html"
         *
         *     // Accept: text/*, application/json
         *     req.accepts('html');
         *     // => "html"
         *     req.accepts('text/html');
         *     // => "text/html"
         *     req.accepts('json, text');
         *     // => "json"
         *     req.accepts('application/json');
         *     // => "application/json"
         *
         *     // Accept: text/*, application/json
         *     req.accepts('image/png');
         *     req.accepts('png');
         *     // => undefined
         *
         *     // Accept: text/*;q=.5, application/json
         *     req.accepts(['html', 'json']);
         *     req.accepts('html, json');
         *     // => "json"
         */
        accepts(type:string): string;

        accepts(type:string[]): string;

        /**
         * Check if the given `charset` is acceptable,
         * otherwise you should respond with 406 "Not Acceptable".
         *
         * @param charset
         */
        acceptsCharset(charset:string): boolean;

        /**
         * Check if the given `lang` is acceptable,
         * otherwise you should respond with 406 "Not Acceptable".
         *
         * @param lang
         */
        acceptsLanguage(lang:string): boolean;

        /**
         * Parse Range header field,
         * capping to the given `size`.
         *
         * Unspecified ranges such as "0-" require
         * knowledge of your resource length. In
         * the case of a byte range this is of course
         * the total number of bytes. If the Range
         * header field is not given `null` is returned,
         * `-1` when unsatisfiable, `-2` when syntactically invalid.
         *
         * NOTE: remember that ranges are inclusive, so
         * for example "Range: users=0-3" should respond
         * with 4 users when available, not 3.
         *
         * @param size
         */
        range(size:number): any[];

        /**
         * Return an array of Accepted media types
         * ordered from highest quality to lowest.
         */
        accepted: MediaType[];

        /**
         * Return an array of Accepted languages
         * ordered from highest quality to lowest.
         *
         * Examples:
         *
         *     Accept-Language: en;q=.5, en-us
         *     ['en-us', 'en']
         */
        acceptedLanguages: any[];

        /**
         * Return an array of Accepted charsets
         * ordered from highest quality to lowest.
         *
         * Examples:
         *
         *     Accept-Charset: iso-8859-5;q=.2, unicode-1-1;q=0.8
         *     ['unicode-1-1', 'iso-8859-5']
         */
        acceptedCharsets: any[];

        /**
         * Return the value of param `name` when present or `defaultValue`.
         *
         *  - Checks route placeholders, ex: _/user/:id_
         *  - Checks body params, ex: id=12, {"id":12}
         *  - Checks query string params, ex: ?id=12
         *
         * To utilize request bodies, `req.body`
         * should be an object. This can be done by using
         * the `connect.bodyParser()` middleware.
         *
         * @param name
         * @param defaultValue
         */
        param(name:string, defaultValue?:any): string;

        /**
         * Check if the incoming request contains the "Content-Type"
         * header field, and it contains the give mime `type`.
         *
         * Examples:
         *
         *      // With Content-Type: text/html; charset=utf-8
         *      req.is('html');
         *      req.is('text/html');
         *      req.is('text/*');
         *      // => true
         *
         *      // When Content-Type is application/json
         *      req.is('json');
         *      req.is('application/json');
         *      req.is('application/*');
         *      // => true
         *
         *      req.is('html');
         *      // => false
         *
         * @param type
         */
        is(type:string): boolean;

        /**
         * Return the protocol string "http" or "https"
         * when requested with TLS. When the "trust proxy"
         * setting is enabled the "X-Forwarded-Proto" header
         * field will be trusted. If you're running behind
         * a reverse proxy that supplies https for you this
         * may be enabled.
         */
        protocol: string;

        /**
         * Short-hand for:
         *
         *    req.protocol == 'https'
         */
        secure: boolean;

        /**
         * Return the remote address, or when
         * "trust proxy" is `true` return
         * the upstream addr.
         */
        ip: string;

        /**
         * When "trust proxy" is `true`, parse
         * the "X-Forwarded-For" ip address list.
         *
         * For example if the value were "client, proxy1, proxy2"
         * you would receive the array `["client", "proxy1", "proxy2"]`
         * where "proxy2" is the furthest down-stream.
         */
        ips: string[];

        /**
         * Return subdomains as an array.
         *
         * Subdomains are the dot-separated parts of the host before the main domain of
         * the app. By default, the domain of the app is assumed to be the last two
         * parts of the host. This can be changed by setting "subdomain offset".
         *
         * For example, if the domain is "tobi.ferrets.example.com":
         * If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
         * If "subdomain offset" is 3, req.subdomains is `["tobi"]`.
         */
        subdomains: string[];

        /**
         * Short-hand for `url.parse(req.url).pathname`.
         */
        path: string;

        /**
         * Parse the "Host" header field hostname.
         */
        host: string;

        /**
         * Check if the request is fresh, aka
         * Last-Modified and/or the ETag
         * still match.
         */
        fresh: boolean;

        /**
         * Check if the request is stale, aka
         * "Last-Modified" and / or the "ETag" for the
         * resource has changed.
         */
        stale: boolean;

        /**
         * Check if the request was an _XMLHttpRequest_.
         */
        xhr: boolean;

        //body: { username: string; password: string; remember: boolean; title: string; };
        body: any;

        //cookies: { string; remember: boolean; };
        cookies: any;

        method: string;

        params: any;

        user: any;

        authenticatedUser: any;

        files: any;

        /**
         * Clear cookie `name`.
         *
         * @param name
         * @param options
         */
        clearCookie(name:string, options?:any): Response;

        query: any;

        route: any;

        signedCookies: any;

        originalUrl: string;

        url: string;

    }

    export interface MediaType {
        value: string;
        quality: number;
        type: string;
        subtype:  string;
    }
}
