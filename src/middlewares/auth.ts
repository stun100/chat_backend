import type { Context } from "hono";
import { env } from "hono/adapter";
import { jwt } from "hono/jwt";
import { API_PREFIX } from "../constants";
import { AUTH_PREFIX, LOGIN_ROUTE, REGISTER_ROUTE } from "../controllers/auth";
import type { ApiUser } from "../models/api";

// Response type -> https://developer.mozilla.org/en-US/docs/Web/API/Response/type
export async function checkJWTAuth(
  c: Context,
  next: () => Promise<void>
): Promise<Response | void> {
  if (
    c.req.path === API_PREFIX + AUTH_PREFIX + LOGIN_ROUTE ||
    c.req.path === API_PREFIX + AUTH_PREFIX + REGISTER_ROUTE
  ) {
    return await next();
  } else {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
    const jwtMiddleware = jwt({
      secret: JWT_SECRET,
    });
    return jwtMiddleware(c, next);
  }
}

export async function attachUserId(
  c: Context,
  next: () => Promise<void>
): Promise<Response | void> {
  const payload = c.get("jwtPayload") as ApiUser;
  if (payload) {
    const id = payload.id;
    c.set("userId", id);
  }
  await next();
}
