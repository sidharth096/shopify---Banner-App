import { PrismaClient } from "@prisma/client";
import createOrUpdateAppMeta from "../helpers/createOrUpdateAppMeta.js";
import { getAppInstallationID } from "../helpers/getAppInstallationID.js";

const prisma = new PrismaClient();

export const createBanner = async (req, res, next) => {

  const { name, title, type, status,link} = req.body; // Extract required banner details from request body
  const shopId = req.shop.id;
  const session = res.locals.shopify.session;
  try {
    // Check if the shop exists before creating the banner
    const shopExists = await prisma.shop.findFirst({
      where: { id: shopId },
    });

    if (!shopExists) {
      return res
        .status(404)
        .json({ message: "Shop not found", success: false });
    }

    // Create a new banner for the existing shop
    const banner = await prisma.banner.create({
      data: {
        name,
        title,
        type,
        status,
        link,
        shop: {
          connect: { id: shopId }, // Connect banner to the existing shop
        },
      },
    });

    const gid = await getAppInstallationID(req.shop.shop, session);

    if (status === true) {
      await createOrUpdateAppMeta(gid, session, banner,link);
    }

    return res
      .status(201)
      .json({ message: "Banner created successfully", banner });
  } catch (error) {
    next(error);
  }
};

export const getBanner = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany();
    return res.status(200).json({ banners });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const session = res.locals.shopify.session;

    const gid = await getAppInstallationID(req.shop.shop, session);

    const banner = { id: id, title: "", type: "", status: false };
    await createOrUpdateAppMeta(gid, session, banner);

    await prisma.banner.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getBannerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findFirst({
      where: { id: parseInt(id) },
    });
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    return res.status(200).json({ success: true, banner });
  } catch (error) {
    next(error);
  }
};

export const editBanner = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;

    console.log("req.body", req.body);
    const { id } = req.params;
    const { name, title, type, status,link } = req.body;
    const banner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: { name, title, type, status,link },
    });

    const gid = await getAppInstallationID(req.shop.shop, session);

    await createOrUpdateAppMeta(gid, session, banner);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    return res.status(200).json({ success: true, banner });
  } catch (error) {
    next(error);
  }
};
