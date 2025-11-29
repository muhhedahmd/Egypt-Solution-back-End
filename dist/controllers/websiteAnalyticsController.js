"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteAnalyticsController = void 0;
class WebsiteAnalyticsController {
    constructor(logic) {
        this.logic = logic;
    }
    collect(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const sessionId = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.pv_sid) || crypto.randomUUID();
                if (!req.cookies["pv_sid"]) {
                    res
                        .cookie("pv_sid", sessionId, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "lax",
                        path: "/",
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                    })
                        .status(200)
                        .json({ message: "ok" });
                }
                const payload = Object.assign(Object.assign({}, req.body), { sessionId, userAgent: req.headers["user-agent"] || "" });
                yield req.app.get("pageviewQueue").add('pv', {
                    payload,
                    ip: req.ip || req.socket.remoteAddress || ""
                });
                return res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.WebsiteAnalyticsController = WebsiteAnalyticsController;
