import { getResults, ScrapeFetchError } from "../../lib/scraper";

export default async function handler(req, res) {

   try {

      const data = await getResults();

      return res.status(200).json({
         success: true,
         data
      });

   } catch (err) {

      if (err instanceof ScrapeFetchError) {

         return res.status(502).json({
            success: false,
            message: err.message,
            upstreamStatus: err.upstreamStatus
         });
      }

      return res.status(500).json({
         success: false,
         error: err.message
      });
   }
}
