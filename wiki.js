/**
 * wiki.js
 *
 * Module for parsing wiki URLs.
 */

/**
 * Importing modules.
 */
// eslint-disable-next-line node/no-extraneous-import
import 'babel-polyfill';
import {validateLanguageCode} from 'locale-code';

/**
 * Constants.
 */
const WIKI_VALIDATION_REGEX = /^\s*https?:\/\/([a-z0-9-.]+)\.(fandom\.com|wikia\.(?:com|org)|(?:wikia|fandom)-dev\.(?:com|us|pl))\/?([a-z-]*)\/?/u;

/**
 * Fandom wiki URL validator.
 */
export default class Wiki {
    /**
     * Class constructor.
     * @param {string} url URL to be validated and parsed
     */
    constructor(url) {
        this.valid = false;
        const result = Wiki.validate(url);
        const subdomain = result.shift(),
              domain = result.shift(),
              language = result.shift(),
              splitSubdomain = subdomain.split('.');
        this.domain = domain === 'wikia.com' ? 'fandom.com' : domain;
        if (validateLanguageCode(`${language}-US`)) {
            this.language = language;
            this.subdomain = subdomain;
        } else if (
            splitSubdomain.length > 1 &&
            validateLanguageCode(`${splitSubdomain[0]}-US`)
        ) {
            this.language = splitSubdomain[0];
            this.subdomain = splitSubdomain.slice(1).join('.');
        } else {
            this.subdomain = subdomain;
        }
    }
    /**
     * Validates a wiki URL.
     * @param {string} url URL to be validated
     * @returns {boolean|Array} Regular expression result
     */
    static validate(url) {
        const result = WIKI_VALIDATION_REGEX.exec(url);
        if (!result) {
            // Invalid URL, return.
            return false;
        }
        result.shift();
        return result;
    }
    /**
     * Gets the wiki URL.
     * @returns {string} The wiki URL
     */
    get url() {
        if (this.language) {
            return `https://${this.subdomain}.${this.domain}/${this.language}`;
        }
        return `https://${this.subdomain}.${this.domain}`;
    }
    /**
     * Gets the URL to the wiki's MediaWiki API endpoint.
     * @returns {string} The URL to the wiki's MediaWiki API endpoint
     */
    get apiUrl() {
        return `${this.url}/api.php`;
    }
}
