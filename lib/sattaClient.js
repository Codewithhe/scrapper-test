import axios from "axios";

const HOME_URL = "https://sattagloble.com";
const AJAX_URL = "https://sattagloble.com/ajax_index";
const USER_AGENT =
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REQUEST_TIMEOUT_MS = 15000;

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

export const fetchLatestData = async () => {

   const home = await axios.get(HOME_URL, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
         "User-Agent": USER_AGENT,
         Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
         "Accept-Language": "en-IN,en;q=0.9"
      }
   });

   const cookies = getCookieHeader(home.headers["set-cookie"]);
   const csrfToken = extractCsrfToken(home.data);

   if (!csrfToken) {
      const error = new Error("CSRF token missing");
      error.statusCode = 502;
      throw error;
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
         timeout: REQUEST_TIMEOUT_MS,
         headers: {
            "Content-Type":
               "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            Referer: `${HOME_URL}/`,
            "User-Agent": USER_AGENT,
            Cookie: cookies,
            ...(xsrfToken
               ? { "X-XSRF-TOKEN": xsrfToken }
               : {})
         }
      }
   );

   if (!response.data?.status) {
      const error = new Error(
         response.data?.message || "Upstream request failed"
      );
      error.statusCode = 502;
      throw error;
   }

   return response.data;
};
