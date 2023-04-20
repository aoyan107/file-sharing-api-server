/*
 *********************************************************** RateLimit MIDDLEWARE **********************************************************
 These methods acts as middleware to check daily download and upload limits for the network traffic from the same IP address
 */

const httpStatus = require('http-status');
const ApiError = require('../helper/ApiError');
const config = require('../config/config');
const RedisService = require('../service/RedisService');

const rateLimit = (type = 'download') => {
    return async (req, res, next) => {
        const redisService = new RedisService();
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const key = `${type}_rate_limit:${ip}`;
        const { uploadLimit, downloadLimit } = config;
        const limit = type === 'upload' ? uploadLimit : downloadLimit;
        const ttl = 24 * 60 * 60; // time-to-live for the key, in seconds
        const count = await redisService.getOrSetValueByKey(key, 0, ttl);
        console.log('===count limit', count, key);
        if (count + 1 > limit) {
            await redisService.increamentValue(key, 1);
            const remainingTtl = await redisService.getTTL(key);
            return next(
                new ApiError(
                    httpStatus.FORBIDDEN,
                    `Daily limit crossed. Retry after ${remainingTtl} seconds`,
                ),
            );
        }

        return next();
    };
};

module.exports = rateLimit;
