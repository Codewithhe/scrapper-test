import axios from "axios";

export default async function handler(req, res) {

   try {

      /*
      -------------------------
      GET HOME PAGE
      -------------------------
      */

      const home = await axios.get(
         "https://sattagloble.com",
         {
            headers: {
               "User-Agent":
                  "Mozilla/5.0"
            }
         }
      );

      /*
      -------------------------
      GET COOKIES
      -------------------------
      */

      const cookies = home.headers["set-cookie"]
         ?.map(cookie => cookie.split(";")[0])
         .join("; ");

      /*
      -------------------------
      FETCH AJAX API
      -------------------------
      */

      const response = await axios.post(
         "https://sattagloble.com/ajax_index",
         {},
         {
            headers: {

               "Content-Type":
                  "application/json",

               "X-Requested-With":
                  "XMLHttpRequest",

               "Referer":
                  "https://sattagloble.com/",

               "User-Agent":
                  "Mozilla/5.0",

               "Cookie":
                  cookies || ""
            }
         }
      );

      /*
      -------------------------
      RETURN DATA
      -------------------------
      */

      return res.status(200).json({
         success: true,
         data: response.data
      });

   } catch (err) {

      console.log(err.message);

      return res.status(500).json({
         success: false,
         error: err.message
      });
   }
}