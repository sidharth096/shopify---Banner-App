import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// export const createBanner = async (req, res, next) => {
//   try {
//     const shop = await prisma.shop.create({
//       data: {
//         email: 'shop@example.com',
//         name: 'Test Shop',
//         shop: 'testshop.myshopify.com',
//         banners: {
//           create: [
//             {
//               name: 'Sample Banner 1',
//               title: 'big sale',
//               type: 'SIMPLE',
//               status: true,
//             },
//             {
//               name: 'Sample Banner 2',
//               title: 'summer sale',
//               type: 'MOVING',
//               status: false,
//             },
//           ],
//         },
//       },
//       include: {
//         banners: true,
//       },
//     });

//     return res.status(200).json({ message: 'Shop and banners created successfully', shop });
//   } catch (error) {

//     next(error);
//   }
// }; 

export const createBanner = async (req, res, next) => {
  console.log("req.body", req.body);
  
  const { name, title, type, status  } = req.body; // Extract required banner details from request body
  const shopId = req.shop.id;

  try {
    // Check if the shop exists before creating the banner
    const shopExists = await prisma.shop.findFirst({
      where: { id: shopId },
    });

    if (!shopExists) {
      return res.status(404).json({ message: "Shop not found",success: false });
    }

    // Create a new banner for the existing shop
    const banner = await prisma.banner.create({
      data: {
        name,
        title,
        type,
        status,
        shop: {
          connect: { id: shopId }, // Connect banner to the existing shop
        },
      },
    });

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
