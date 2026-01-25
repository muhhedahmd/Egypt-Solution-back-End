"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slideShowsKey = exports.slideShowKeyById = exports.getKeyName = void 0;
const getKeyName = (...args) => `Landing:${args.join(":")}`;
exports.getKeyName = getKeyName;
const slideShowKeyById = (id) => (0, exports.getKeyName)("slideShow", id);
exports.slideShowKeyById = slideShowKeyById;
const slideShowsKey = (params) => (0, exports.getKeyName)("slideShow", params);
exports.slideShowsKey = slideShowsKey;
