import { createClient , type RedisClientType} from "redis";


let redisClient: RedisClientType | null = null;

export const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = createClient( { 
            url : process.env.REDIS_URL || 'redis://localhost:6379'
        })
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis Client Connected'));
        await redisClient.connect();

    }

    return redisClient;
};