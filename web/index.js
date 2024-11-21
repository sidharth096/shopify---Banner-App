// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import router from "./routes.js";
import setUpShop from "./helpers/setUpShop.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

debugger;   
console.log("======================", );

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res, next) => {
    try {
      console.log("=====================", req.query);
      const session = res.locals.shopify.session;
      console.log("session", session);
      setUpShop(req, res, session);

      next();
    } catch (error) {
      next(error);
    }
  },
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*",checkAuth, shopify.validateAuthenticatedSession());

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

app.use(express.json());

app.use("/api", router);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "server error",
  });
});

async function checkAuth(req, res, next) {
  let shop = req.query.shop;
  // console.log("req.query", req.query);
  
  console.log("shop====================", shop);
  if (shop) {
    let shopData = await prisma.shop.findFirst({
      where: { shop },
      select: {
        id: true,
        shop: true,
        accessToken: true,
        email: true,
        name: true,
      },
    });

    req.shop = shopData;
    console.log("req.shop", req.shop);
  }
  next();
}

app.listen(PORT);
