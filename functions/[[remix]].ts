import { createRequestHandler } from "@remix-run/cloudflare";
import { type AppLoadContext } from "@remix-run/server-runtime";

import * as build from "#build";

let remixHandler: ReturnType<typeof createRequestHandler>;

export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (!remixHandler) {
    remixHandler = createRequestHandler(
      build as any,
      ctx.env.CF_PAGES ? "production" : "development"
    );
  }

  const loadContext: AppLoadContext = {
    cf: ctx.request.cf,
    DB: ctx.env.DB,
  };

  return await remixHandler(ctx.request, loadContext);
};
