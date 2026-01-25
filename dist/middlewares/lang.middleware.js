"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nMiddleware = i18nMiddleware;
const SUPPORTED_LANGUAGES = ["EN", "AR"];
const DEFAULT_LANGUAGE = "EN";
function i18nMiddleware(req, res, next) {
    let lang = DEFAULT_LANGUAGE;
    if (!req.query.lang) {
        req.query.lang = DEFAULT_LANGUAGE;
    }
    if (req.query.lang &&
        typeof req.query.lang === "string" &&
        SUPPORTED_LANGUAGES.includes(req.query.lang.toUpperCase())) {
        lang = req.query.lang.toUpperCase();
    }
    else if (req.cookies.user_lang &&
        SUPPORTED_LANGUAGES.includes(req.cookies.user_lang)) {
        lang = req.cookies.user_lang;
    }
    else if (req.headers["accept-language"]) {
        const browserLang = req.headers["accept-language"]
            .split(",")[0]
            .split("-")[0]
            .toUpperCase();
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            lang = browserLang;
        }
    }
    req.lang = lang;
    req.isRTL = lang === "AR";
    next();
}
