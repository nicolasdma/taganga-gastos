/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as dates from "../dates.js";
import type * as expenses from "../expenses.js";
import type * as households from "../households.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_households from "../lib/households.js";
import type * as lib_items from "../lib/items.js";
import type * as lib_userPreferences from "../lib/userPreferences.js";
import type * as migrations from "../migrations.js";
import type * as receiptScan from "../receiptScan.js";
import type * as userPreferences from "../userPreferences.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  dates: typeof dates;
  expenses: typeof expenses;
  households: typeof households;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/households": typeof lib_households;
  "lib/items": typeof lib_items;
  "lib/userPreferences": typeof lib_userPreferences;
  migrations: typeof migrations;
  receiptScan: typeof receiptScan;
  userPreferences: typeof userPreferences;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
