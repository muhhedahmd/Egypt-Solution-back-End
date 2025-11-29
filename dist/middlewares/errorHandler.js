"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const services_error_1 = require("../errors/services.error");
const client_error_1 = require("../errors/client.error");
const team_error_1 = require("../errors/team.error");
const testimonal_error_1 = require("../errors/testimonal.error");
function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof services_error_1.ServiceError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            code: err.code,
            name: err.name,
        });
    }
    if (err instanceof client_error_1.ClientError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            code: err.code,
            name: err.name,
        });
    }
    if ((err instanceof team_error_1.TeamError) || (err instanceof testimonal_error_1.TestimonialError)) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            code: err.code,
            name: err.name,
        });
    }
    if (err instanceof team_error_1.TeamError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            code: err.code,
            name: err.name,
        });
    }
    if (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            code: err.code,
            name: err.name,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}
