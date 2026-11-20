// Checks that Swagger documents the errors the API really sends, and nothing is forgotten
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { ERRORS } from "@/lib/errors";
import { buildOpenApiDocument } from "@/lib/openapi";
import { prisma } from "@/lib/prisma";
import * as events from "@/app/api/events/route";
import * as posts from "@/app/api/posts/route";
import * as reports from "@/app/api/reports/route";
import * as post from "@/app/api/posts/[id]/route";
import * as like from "@/app/api/posts/[id]/like/route";
import * as comments from "@/app/api/posts/[id]/comments/route";
import * as user from "@/app/api/users/[id]/route";
import * as stats from "@/app/api/users/[id]/stats/route";
import * as me from "@/app/api/users/me/route";
import * as register from "@/app/api/auth/register/route";
import * as login from "@/app/api/auth/login/route";
import { createUser, request, resetDb } from "../helpers";

const doc = buildOpenApiDocument();
const UNKNOWN = "00000000-0000-4000-8000-000000000000";

// Directory of a route file -> path in the OpenAPI document ([id] -> {id})
function apiRoutes(
  dir = path.resolve(__dirname, "../../app/api"),
  prefix = "/api",
) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isFile()) return entry.name === "route.js" ? [prefix] : [];
    const segment = entry.name.replace(/^\[(.+)\]$/, "{$1}");
    return apiRoutes(path.join(dir, entry.name), `${prefix}/${segment}`);
  });
}

describe("OpenAPI document", () => {
  it("documents every route of app/api", () => {
    for (const route of apiRoutes())
      expect(Object.keys(doc.paths), route).toContain(route);
  });

  it("documents a problem+json 500 on every operation, and a 401 on every protected one", () => {
    for (const [route, operations] of Object.entries(doc.paths)) {
      for (const [method, operation] of Object.entries(operations)) {
        const name = `${method.toUpperCase()} ${route}`;
        expect(
          operation.responses["500"]?.content?.["application/problem+json"],
          name,
        ).toBeDefined();
        if (operation.security)
          expect(operation.responses["401"], name).toBeDefined();
      }
    }
  });

  it("lists every error code in the Problem schema and in ERRORS.md", () => {
    const catalogue = fs.readFileSync(
      path.resolve(__dirname, "../../../ERRORS.md"),
      "utf8",
    );
    expect(doc.components.schemas.Problem.properties.code.enum.sort()).toEqual(
      Object.keys(ERRORS).sort(),
    );
    for (const code of Object.keys(ERRORS))
      expect(catalogue, code).toContain(`\`${code}\``);
  });
});

describe("errors sent by the API are the documented ones", () => {
  let ctx;
  beforeEach(async () => {
    await resetDb();
    const author = await createUser("Author");
    const other = await createUser("Other");
    const created = await posts.POST(
      request("/api/posts", {
        method: "POST",
        token: author.token,
        body: { content: "Hello" },
      }),
    );
    ctx = { author, other, post: (await created.json()).post };
  });

  const id = (value) => ({ params: { id: value } });
  const cases = [
    [
      "get",
      "/api/posts",
      () => posts.GET(request("/api/posts")),
      "LL_AUTH_401",
    ],
    [
      "post",
      "/api/posts",
      (c) =>
        posts.POST(
          request("/api/posts", {
            method: "POST",
            token: c.author.token,
            body: {},
          }),
        ),
      "LL_VALIDATION_422",
    ],
    [
      "delete",
      "/api/posts/{id}",
      (c) =>
        post.DELETE(
          request("/", { method: "DELETE", token: c.other.token }),
          id(c.post.id),
        ),
      "LL_AUTH_403",
    ],
    [
      "delete",
      "/api/posts/{id}",
      (c) =>
        post.DELETE(
          request("/", { method: "DELETE", token: c.author.token }),
          id(UNKNOWN),
        ),
      "LL_POST_404",
    ],
    [
      "post",
      "/api/posts/{id}/like",
      (c) =>
        like.POST(
          request("/", { method: "POST", token: c.author.token }),
          id("not-an-id"),
        ),
      "LL_POST_404",
    ],
    [
      "get",
      "/api/posts/{id}/comments",
      (c) => comments.GET(request("/", { token: c.author.token }), id(UNKNOWN)),
      "LL_POST_404",
    ],
    [
      "post",
      "/api/posts/{id}/comments",
      (c) =>
        comments.POST(
          request("/", {
            method: "POST",
            token: c.author.token,
            body: { content: "" },
          }),
          id(c.post.id),
        ),
      "LL_VALIDATION_422",
    ],
    [
      "post",
      "/api/reports",
      (c) =>
        reports.POST(
          request("/api/reports", {
            method: "POST",
            token: c.other.token,
            body: { postId: c.post.id },
          }),
        ),
      "LL_VALIDATION_422",
    ],
    [
      "post",
      "/api/reports",
      (c) =>
        reports.POST(
          request("/api/reports", {
            method: "POST",
            token: c.author.token,
            body: { postId: c.post.id, reason: "abus" },
          }),
        ),
      "LL_AUTH_403",
    ],
    [
      "post",
      "/api/reports",
      (c) =>
        reports.POST(
          request("/api/reports", {
            method: "POST",
            token: c.other.token,
            body: { postId: UNKNOWN, reason: "abus" },
          }),
        ),
      "LL_POST_404",
    ],
    [
      "post",
      "/api/reports",
      async (c) => {
        const send = () =>
          reports.POST(
            request("/api/reports", {
              method: "POST",
              token: c.other.token,
              body: { postId: c.post.id, reason: "abus" },
            }),
          );
        await send();
        return send();
      },
      "LL_REPORT_409",
    ],
    [
      "get",
      "/api/events",
      () => events.GET(request("/api/events")),
      "LL_AUTH_401",
    ],
    [
      "post",
      "/api/events",
      (c) =>
        events.POST(
          request("/api/events", {
            method: "POST",
            token: c.author.token,
            body: {},
          }),
        ),
      "LL_VALIDATION_422",
    ],
    [
      "post",
      "/api/events",
      async (c) => {
        // Account created before the zones
        await prisma.user.update({
          where: { id: c.other.user.id },
          data: { zoneId: null },
        });
        return events.POST(
          request("/api/events", {
            method: "POST",
            token: c.other.token,
            body: {
              title: "Fête des voisins",
              description: "Chacun apporte un plat.",
              place: "Place du Salin",
              startsAt: new Date(Date.now() + 86_400_000).toISOString(),
            },
          }),
        );
      },
      "LL_ZONE_404",
    ],
    [
      "get",
      "/api/users/{id}",
      (c) => user.GET(request("/", { token: c.author.token }), id(UNKNOWN)),
      "LL_USER_404",
    ],
    [
      "get",
      "/api/users/{id}/stats",
      (c) => stats.GET(request("/", { token: c.author.token }), id(UNKNOWN)),
      "LL_USER_404",
    ],
    [
      "put",
      "/api/users/me",
      (c) =>
        me.PUT(
          request("/", {
            method: "PUT",
            token: c.author.token,
            body: { avatar: "nope" },
          }),
        ),
      "LL_VALIDATION_422",
    ],
    [
      "post",
      "/api/auth/register",
      (c) =>
        register.POST(
          request("/", {
            method: "POST",
            body: {
              firstName: "A",
              lastName: "B",
              email: c.author.user.email,
              password: "secret123",
              zoneId: c.author.user.zoneId,
            },
          }),
        ),
      "LL_EMAIL_409",
    ],
    [
      "post",
      "/api/auth/login",
      () =>
        login.POST(
          request("/", {
            method: "POST",
            body: { email: "nobody@test.fr", password: "wrong-pass" },
          }),
        ),
      "LL_LOGIN_401",
    ],
  ];

  it.each(
    cases.map(([m, r, call, code]) => [
      `${m.toUpperCase()} ${r} -> ${code}`,
      m,
      r,
      call,
      code,
    ]),
  )("%s", async (_, method, route, call, code) => {
    const res = await call(ctx);
    const body = await res.json();
    const documented = doc.paths[route][method].responses[String(res.status)];

    expect(body.code).toBe(code);
    expect(res.status).toBe(ERRORS[code].status);
    expect(
      documented,
      `${res.status} not documented on ${method} ${route}`,
    ).toBeDefined();
    expect(documented.description).toContain(code);
    expect(Object.keys(body)).toEqual(
      expect.arrayContaining(doc.components.schemas.Problem.required),
    );
  });
});
