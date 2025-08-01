import { createQwikCity } from "@builder.io/qwik-city/middleware/node";
import fastifyStatic from "@fastify/static";
import qwikCityPlan from "@qwik-city-plan";
import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import proxy from "@fastify/http-proxy";

import { renderHost } from "../entry.ssr";

export interface FastifyQwikOptions {
  distDir: string;
  buildDir: string;
  assetsDir: string;
}

const { router, notFound } = createQwikCity({
  render: renderHost,
  qwikCityPlan,
});

const qwikPlugin: FastifyPluginAsync<FastifyQwikOptions> = async (
  fastify,
  options,
) => {
  const { buildDir, distDir, assetsDir } = options;

  fastify.register(proxy, {
    upstream: "http://localhost:4567",
    prefix: "/w/counter",
    rewritePrefix: "/w/counter",
    http2: false,
  });
  fastify.register(proxy, {
    upstream: "http://localhost:4568",
    prefix: "/w/react",
    rewritePrefix: "/w/react",
    http2: false,
  });

  fastify.register(fastifyStatic, {
    root: buildDir,
    prefix: "/build",
    immutable: true,
    maxAge: "1y",
    decorateReply: false,
  });

  fastify.register(fastifyStatic, {
    root: assetsDir,
    prefix: "/assets",
    immutable: true,
    maxAge: "1y",
  });

  fastify.register(fastifyStatic, {
    root: distDir,
    redirect: false,
    decorateReply: false,
  });

  fastify.removeAllContentTypeParsers();

  fastify.setNotFoundHandler(async (request, response) => {
    await router(request.raw, response.raw, (err) => fastify.log.error(err));
    await notFound(request.raw, response.raw, (err) => fastify.log.error(err));
  });
};

export default fastifyPlugin(qwikPlugin, { fastify: ">=4.0.0 <6.0.0" });
