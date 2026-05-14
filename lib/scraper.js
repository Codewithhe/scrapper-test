import axios from "axios";

const URL = "https://sattagloble.com/ajax_index";

export const getResults = async () => {

   try {

      const home = await axios.get(
         "https://sattagloble.com",
         {
            headers: {
               "User-Agent": "Mozilla/5.0"
            }
         }
      );

      const cookies = home.headers["set-cookie"]
         .map(cookie => cookie.split(";")[0])
         .join("; ");

      const response = await axios.post(
         URL,
         {},
         {
            headers: {
               "Content-Type": "application/json",
               "X-Requested-With": "XMLHttpRequest",
               "Referer": "https://sattagloble.com/",
               "User-Agent": "Mozilla/5.0",
               "Cookie": cookies
            }
         }
      );

      return response.data;

   } catch (err) {

      console.log(err.message);

      return null;
   }
};
