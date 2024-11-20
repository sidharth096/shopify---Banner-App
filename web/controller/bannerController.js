
export const createBanner = (req,res,next)=>{
  try {
    console.log("======================");
    return res.status(200).json("message:hai")
  } catch (error) {
    next(error)
  }
}