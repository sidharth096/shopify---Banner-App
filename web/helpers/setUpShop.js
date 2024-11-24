import { PrismaClient } from "@prisma/client";
import { encrypt } from "./encryption.js";
import shopify from "../shopify.js";

const prisma = new PrismaClient();

export default async (req, res, session) => {
  console.log("::::::::::::::::::: Entered setupShop :::::::::::::::::::",session);
  const { shop } = req.query; // Extracting 'shop' from query params
  const encryptionKey = process.env.BANNER_SUPERKEY || "1a2b3c4d5e6f7g8h";

  try {
    if (!shop) {
      return res.status(400).json({ error: "Shop parameter is required" });
    }

    // Encrypt the session access token
    const encryptedToken = encrypt(session.accessToken, encryptionKey);
    console.log("::::::::::::::::: Encrypted Token :::::::::::::::::", encryptedToken);

    // Fetch shop data from the database
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

    // If shop does not exist in the database, fetch details from Shopify and create a new shop
    if (!shopData) {
      console.log("Shop not found, creating a new shop...");

      // Fetch shop details from Shopify API (adjust this to fit your Shopify setup)
      
      const shopDetails = await shopify.api.rest.Shop.all({
        session,
      });

      console.log("shopDetails======",shopDetails);

      const {
        name,
        email,

      } = shopDetails.data[0];

      // Create the shop in the database
      shopData = await prisma.shop.create({
        data: {
          shop: shop, // shop is the unique identifier
          accessToken: encryptedToken, // Encrypted access token
          email: email, // Shopify email
          name: name, // Shopify shop name
        },
      });
    } else {
      
    }

    // Attach the shop data to the request object
    req.shop = shopData;

    // Respond with success and the shop data
    return res

  } catch (error) {
    console.error("Error in setupShop:", error);
    return res.status(500).json({ error: "Failed to set up shop" });
  } finally {
    await prisma.$disconnect();
  }
};
