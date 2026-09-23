"use strict";

const { API_URL } = require("../config");

/** Public base URL of the API as the browser sees it.
 *
 * Uses API_URL when set. Otherwise builds it from the request, honouring the
 * headers set by proxies in front of the API: the frontend's nginx
 * (X-Forwarded-Host/-Proto/-Prefix) and Cloudflare (X-Forwarded-Proto).
 *
 * e.g. https://abc.trycloudflare.com/api
 */
function apiBaseUrl(req, apiUrl = API_URL) {
  if (apiUrl) return apiUrl;
  const first = value => value.split(",")[0].trim();
  const proto = first(req.get("x-forwarded-proto") || req.protocol);
  const host = first(req.get("x-forwarded-host") || req.get("host"));
  const prefix = req.get("x-forwarded-prefix") || "";
  return `${proto}://${host}${prefix}`;
}

module.exports = { apiBaseUrl };
