import { getResults } from "../../lib/scraper";

export default async function handler(req, res) {

   try {

      const data = await getResults();

      if (!data) {

         return res.status(502).json({
            success: false,
            message: "fetch failed"
         });
      }

      return res.status(200).json({
         success: true,
         data
      });

   } catch (err) {

      return res.status(500).json({
         success: false,
         error: err.message
      });
   }
}
