import axios from "axios";

const HOME_URL = "https://sattagloble.com";
const AJAX_URL = "https://sattagloble.com/ajax_index";
const USER_AGENT =
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const getCookieHeader = (setCookie) => {

   if (!setCookie?.length) {
      return "";
   }

   return setCookie
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
};

const getXsrfToken = (cookies) => {

   const match = cookies.match(/XSRF-TOKEN=([^;]+)/);

   if (!match) {
      return null;
   }

   try {
      return decodeURIComponent(match[1]);
   } catch {
      return match[1];
   }
};

const extractCsrfToken = (html) => {

   const match = html.match(
      /<meta name="csrf-token" content="([^"]+)"/
   );

   return match?.[1] ?? null;
};

export const getResults = async () => {

   try {

      const home = await axios.get(HOME_URL, {
         headers: {
            "User-Agent": USER_AGENT,
            Accept:
               "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
         }
      });

      const cookies = getCookieHeader(home.headers["set-cookie"]);
      const csrfToken = extractCsrfToken(home.data);

      if (!csrfToken) {
         console.log("CSRF token missing");
         return null;
      }

      const payload = new URLSearchParams({
         nav: "dashboard",
         Method: "ajax_khabar_home",
         _token: csrfToken
      });

      const xsrfToken = getXsrfToken(cookies);

      const response = await axios.post(
         AJAX_URL,
         payload.toString(),
         {
            headers: {
               "User-Agent": USER_AGENT,
               Accept: "application/json, text/javascript, */*; q=0.01",
               "Content-Type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
               "X-Requested-With": "XMLHttpRequest",
               Referer: `${HOME_URL}/`,
               Origin: HOME_URL,
               Cookie: cookies,
               ...(xsrfToken
                  ? { "X-XSRF-TOKEN": xsrfToken }
                  : {})
            }
         }
      );

      if (!response.data?.status) {
         console.log(response.data?.message || "Upstream request failed");
         return null;
      }

      return response.data;

   } catch (err) {

      console.log(
         err.response?.status || "error",
         err.message
      );

      return null;
   }
};
