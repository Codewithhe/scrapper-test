import { getRedis } from "../../lib/redis";
import { fetchLatestData } from "../../lib/sattaClient";

const CACHE_KEY = "satta_latest_data";

const isSameData = (cachedData, freshData) => {

   return JSON.stringify(cachedData) === JSON.stringify(freshData);
};

export default async function handler(req, res) {

   try {

      const redis = getRedis();
      const cachedData = await redis.get(CACHE_KEY);
      const freshData = await fetchLatestData();

      if (cachedData && isSameData(cachedData, freshData)) {

         return res.status(200).json({
            success: true,
            cached: true,
            data: cachedData
         });
      }

      await redis.set(CACHE_KEY, freshData);

      return res.status(200).json({
         success: true,
         cached: false,
         data: freshData
      });

   } catch (err) {

      if (err.message?.includes("UPSTASH_REDIS_REST")) {

         return res.status(500).json({
            success: false,
            cached: false,
            message: err.message
         });
      }

      try {

         const redis = getRedis();
         const cachedData = await redis.get(CACHE_KEY);

         if (cachedData) {

            return res.status(200).json({
               success: true,
               cached: true,
               data: cachedData
            });
         }

      } catch {
         // Fall through to the upstream error response.
      }

      const statusCode = err.response?.status || err.statusCode || 500;

      return res.status(statusCode >= 400 && statusCode < 600
         ? statusCode
         : 500).json({
         success: false,
         cached: false,
         message: err.response?.data?.message || err.message
      });
   }
}
