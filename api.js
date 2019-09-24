/**
 * api.js
 *
 * Module for communicating with Fandom's API.
 */

/**
 * Importing modules.
 */
// eslint-disable-next-line
import 'babel-polyfill';
import FormData from 'form-data';
import cookie from 'tough-cookie';
import cookieJarSupport from 'axios-cookiejar-support';
import http from 'axios';
import querystring from 'querystring';

/**
 * Setup HTTP agent.
 */
cookieJarSupport(http);

/**
 *
 */
export default class UploaderApi {
    /**
     * Class constructor.
     * @param {Wiki} wikiFrom Wiki from which to list images
     * @param {Wiki} wikiTo Wiki to which the images should be uploaded
     */
    constructor(wikiFrom, wikiTo) {
        this._from = wikiFrom;
        this._to = wikiTo;
        http.defaults.headers.common['User-Agent'] =
            'Fandom image transfer client';
        http.defaults.jar = new cookie.CookieJar();
        http.defaults.withCredentials = true;
    }
    /**
     * Logs in to Fandom.
     * @param {string} username Fandom username
     * @param {string} password Fandom password
     * @returns {Promise} Promise that resolves when the user logs in
     */
    login(username, password) {
        return http.post(
            `https://services.${this._to.domain}/auth/token`,
            querystring.stringify({
                password,
                username
            })
        );
    }
    /**
     * Gets the current user's edit token.
     * @returns {Promise} Promise that resolves with the user's edit token
     */
    token() {
        return http.get(this._to.apiUrl, {
            params: {
                action: 'query',
                format: 'json',
                intoken: 'edit',
                prop: 'info',
                titles: '#'
            },
            transformResponse: [
                d => JSON.parse(d).query.pages[-1].edittoken
            ]
        });
    }
    /**
     * Lists all images on a certain wiki, along with their URLs.
     * @returns {Array<Image>} List of found image objects
     */
    async listAll() {
        const images = [];
        let gapfrom = null;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const response = await http.get(this._from.apiUrl, {
                params: {
                    action: 'query',
                    format: 'json',
                    gapfrom,
                    gaplimit: 'max',
                    gapnamespace: 6,
                    generator: 'allpages',
                    iiprop: 'url',
                    prop: 'imageinfo'
                }
            }), {pages} = response.data.query,
                cont = response.data['query-continue'];
            for (const page in pages) {
                const p = pages[page];
                if (p.imageinfo) {
                    images.push({
                        title: p.title,
                        url: p.imageinfo[0].url
                    });
                }
            }
            if (cont) {
                ({gapfrom} = cont.allpages.gapfrom);
            } else {
                break;
            }
        }
        return images;
    }
    /**
     * Finds URLs to specified images on a certain wiki.
     * @param {Array<string>} imageList Images whose URLs should be found
     * @returns {Array<Image>} List of found image objects
     */
    async listSome(imageList) {
        const images = imageList.slice(0),
              result = [];
        while (images.length) {
            const batch = images.splice(0, 50),
                  response = await http.get(this._from.apiUrl, {
                params: {
                    'action': 'query',
                    'format': 'json',
                    'iiprop': 'url',
                    'prop': 'imageinfo',
                    'titles': batch.join('|'),
                    // Weird redirection bug.
                    /* eslint-disable-next-line sort-keys */
                    '*': '0'
                }
            }), {pages} = response.data.query;
            for (const page in pages) {
                const p = pages[page];
                if (p.imageinfo) {
                    result.push({
                        title: p.title,
                        url: p.imageinfo[0].url
                    });
                }
            }
        }
        return result;
    }
    /**
     * Uploads an image via the MediaWiki API.
     * @param {object} image Object representing an image returned from list()
     * @param {string} image.title Filename of the image to upload
     * @param {string} image.url URL of the image to upload
     * @param {string} comment Comment used when uploading the file
     * @returns {Promise} Promise that resolves when the upload finishes
     */
    async upload(image, {
        comment, ignoreWarnings, text, watchlist
    }) {
        const token = (await this.token()).data;
        const form = new FormData();
        form.append('action', 'upload');
        form.append('filename', image.title);
        form.append('format', 'json');
        form.append('token', token);
        if (comment) {
            form.append('comment', comment);
        }
        if (ignoreWarnings) {
            form.append('ignorewarnings', '1');
        }
        if (text) {
            form.append('text', text);
        }
        if (watchlist) {
            form.append('watchlist', watchlist);
        }
        form.append('file', (await http.get(`${image.url}&format=original`, {
            responseType: 'stream'
        })).data);
        return http.post(this._to.apiUrl, form, {
            headers: form.getHeaders()
        });
    }
}
