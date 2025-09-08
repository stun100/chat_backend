import { Hono } from "hono";
import { env } from "hono/adapter";
import { sign } from "hono/jwt";
import type { ContextVariables } from "../constants";
import type { DBCreateUser, DBUser, Email } from "../models/db";
import type { IDatabaseResource } from "../storage/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const AUTH_PREFIX = "/auth/";
export const authApp = new Hono<ContextVariables>();
export const LOGIN_ROUTE = "login/";
export const REGISTER_ROUTE = "register/";
export const ERROR_USER_ALREADY_EXIST = "USER_ALREADY_EXIST";
export const ERROR_INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

const registerSchema = z.object({
  email: z.email().transform((x) => x as Email),
  password: z.string().min(1),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.email().transform((x) => x as Email),
  password: z.string().min(1),
});

export function createAuthApp(
  userResource: IDatabaseResource<DBUser, DBCreateUser>
) {
  authApp.post(
    REGISTER_ROUTE,
    zValidator("json", registerSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: result.success,
            error: {
              name: result.error.name,
              issues: result.error.issues,
            },
          },
          400
        );
      }
    }),
    // zValidator("json", registerSchema),
    async (c) => {
      const { email, password, name } = c.req.valid("json");
      if (await userResource.find({ email })) {
        return c.json({ error: ERROR_USER_ALREADY_EXIST }, 400);
      }
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "bcrypt",
      });
      await userResource.create({ name, email, password: hashedPassword });
      return c.json({ success: true });
    }
  );

  // Returns an instance of Hono class
  authApp.post(
    LOGIN_ROUTE,
    zValidator("json", loginSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: result.success,
            error: {
              name: result.error.name,
              issues: result.error.issues,
            },
          },
          400
        );
      }
    }),
    async (c) => {
      const { email, password } = c.req.valid("json");
      const fulluser = await userResource.find({ email });
      if (
        !fulluser ||
        !(await Bun.password.verify(password, fulluser.password))
      ) {
        return c.json({ error: ERROR_INVALID_CREDENTIALS }, 401);
      }
      const { JWT_SECRET } = env<{ JWT_SECRET: string }, typeof c>(c);
      const token = await sign(
        { ...fulluser, password: undefined },
        JWT_SECRET
      );
      return c.json({ token });
    }
  );
  return authApp;
}
