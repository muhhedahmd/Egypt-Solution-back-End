import { Request, NextFunction, Response } from "express";

const SUPPORTED_LANGUAGES = ["EN", "AR"];
const DEFAULT_LANGUAGE = "EN";

export function i18nMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let lang = DEFAULT_LANGUAGE;

  if (!req.query.lang) {
    req.query.lang = DEFAULT_LANGUAGE;
  }

  if (
    req.query.lang &&
    typeof req.query.lang === "string" &&
    SUPPORTED_LANGUAGES.includes(req.query.lang.toUpperCase())
  ) {
    lang = req.query.lang.toUpperCase();
  }

  else if (
    req.cookies.user_lang &&
    SUPPORTED_LANGUAGES.includes(req.cookies.user_lang)
  ) {
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
