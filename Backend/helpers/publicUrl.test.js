"use strict";

const { apiBaseUrl } = require("./publicUrl");

function fakeReq(headers, protocol = "http") {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return { protocol, get: name => lower[name.toLowerCase()] };
}

describe("apiBaseUrl", function () {
  test("uses API_URL when set", function () {
    expect(apiBaseUrl(fakeReq({ host: "ignored" }), "http://localhost:3001"))
        .toEqual("http://localhost:3001");
  });

  test("direct request without a proxy", function () {
    expect(apiBaseUrl(fakeReq({ host: "localhost:3001" }), ""))
        .toEqual("http://localhost:3001");
  });

  test("behind nginx and a Cloudflare tunnel", function () {
    const req = fakeReq({
      host: "backend:3001",
      "X-Forwarded-Host": "abc.trycloudflare.com",
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Prefix": "/api",
    });
    expect(apiBaseUrl(req, "")).toEqual("https://abc.trycloudflare.com/api");
  });

  test("uses the first value of comma-separated forwarded headers", function () {
    const req = fakeReq({
      host: "backend:3001",
      "X-Forwarded-Host": "abc.trycloudflare.com, frontend",
      "X-Forwarded-Proto": "https, http",
    });
    expect(apiBaseUrl(req, "")).toEqual("https://abc.trycloudflare.com");
  });
});
