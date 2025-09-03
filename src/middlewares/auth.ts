import type { Context } from "hono";
import { env } from "hono/adapter";
import { jwt } from "hono/jwt";
import { API_PREFIX } from "../constants";
import { AUTH_PREFIX, LOGIN_ROUTE, REGISTER_ROUTE } from "../
controllers/auth";
import type { APIUser } from "../models/api";