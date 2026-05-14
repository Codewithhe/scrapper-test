import { Redis } from "@upstash/redis";

let redis;

export const getRedis = () => {

   if (redis) {
      return redis;
   }

   const url = process.env.UPSTASH_REDIS_REST_URL;
   const token = process.env.UPSTASH_REDIS_REST_TOKEN;

   if (!url || !token) {
      throw new Error(
         "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required"
      );
   }

   redis = new Redis({
      url,
      token
   });

   return redis;
};
