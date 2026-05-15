const HOME_URL = "https://satta-king-fast.com";
const AJAX_URL = "https://sattagloble.com/ajax_index";
const USER_AGENT =
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BROWSER_HEADERS = {
   "User-Agent": USER_AGENT,
   Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
   "Accept-Language": "en-IN,en;q=0.9",
   "Cache-Control": "no-cache",
   Pragma: "no-cache",
   "Upgrade-Insecure-Requests": "1",
   "Sec-Fetch-Dest": "document",
   "Sec-Fetch-Mode": "navigate",
   "Sec-Fetch-Site": "none",
   "Sec-Fetch-User": "?1"
};

const AJAX_HEADERS = {
   "User-Agent": USER_AGENT,
   Accept: "application/json, text/javascript, */*; q=0.01",
   "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
   "X-Requested-With": "XMLHttpRequest",
   Referer: `${HOME_URL}/`,
   Origin: HOME_URL,
   "Accept-Language": "en-IN,en;q=0.9"
};

const SCRAPER_SESSION = String(Date.now());

export class ScrapeFetchError extends Error {

   constructor(message, upstreamStatus) {
      super(message);
      this.upstreamStatus = upstreamStatus;
   }
}

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

const getSetCookieHeaders = (response) => {

   if (typeof response.headers.getSetCookie === "function") {
      return response.headers.getSetCookie();
   }

   const cookie = response.headers.get("set-cookie");

   return cookie ? [cookie] : [];
};

const buildRequestTarget = (targetUrl) => {

   const apiKey = process.env.SCRAPER_API_KEY;

   if (!apiKey) {
      return targetUrl;
   }

   const apiUrl = new URL("https://api.scraperapi.com");

   apiUrl.searchParams.set("api_key", apiKey);
   apiUrl.searchParams.set("url", targetUrl);
   apiUrl.searchParams.set("session_number", SCRAPER_SESSION);
   apiUrl.searchParams.set("country_code", "in");

   return apiUrl.toString();
};

const request = async (targetUrl, init = {}) => {

   return fetch(buildRequestTarget(targetUrl), {
      ...init,
      redirect: "manual"
   });
};

const ensureOk = async (response, step) => {

   if (response.ok) {
      return;
   }

   const body = await response.text();
   const preview = body.replace(/\s+/g, " ").slice(0, 160);

   throw new ScrapeFetchError(
      `${step} failed with status ${response.status}${preview ? `: ${preview}` : ""}`,
      response.status
   );
};

export const getResults = async () => {

   const home = await request(HOME_URL, {
      headers: BROWSER_HEADERS
   });

   await ensureOk(home, "Homepage request");

   const cookies = getCookieHeader(getSetCookieHeaders(home));
   const html = await home.text();
   const csrfToken = extractCsrfToken(html);

   if (!csrfToken) {
      throw new ScrapeFetchError("CSRF token missing", 502);
   }

   const payload = new URLSearchParams({
      nav: "dashboard",
      Method: "ajax_khabar_home",
      _token: csrfToken
   });

   const xsrfToken = getXsrfToken(cookies);

   const response = await request(AJAX_URL, {
      method: "POST",
      headers: {
         ...AJAX_HEADERS,
         Cookie: cookies,
         ...(xsrfToken
            ? { "X-XSRF-TOKEN": xsrfToken }
            : {})
      },
      body: payload.toString()
   });

   await ensureOk(response, "AJAX request");

   const data = await response.json();

   if (!data?.status) {
      throw new ScrapeFetchError(
         data?.message || "Upstream request failed",
         502
      );
   }

   return data;
};
