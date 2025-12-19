import Razorpay from "razorpay"
import {Course} from "../models/course.model.js" 
import {CoursePurchase} from "../models/coursePurchase.model.js"
const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_SECRET_KEY
})


export const createCheckoutSession = async (req, res) => {
  try {
      console.log("User ID:", req.id);
      console.log("Course ID:", req.body.courseId);
      console.log("Razorpay API Key:", process.env.RAZORPAY_API_KEY ? "Loaded" : "Missing");
      console.log("Razorpay Secret:", process.env.RAZORPAY_SECRET_KEY ? "Loaded" : "Missing");

    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // Create order in Razorpay
    const options = {
      amount: course.coursePrice * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: course._id.toString(),
        userId: userId.toString(),
      },
    };

    console.log("Creating Razorpay order with options:", options);
const order = await razorpay.orders.create(options);
console.log("Razorpay order created successfully:", order);

    // Create a new purchase record with pending status
    const newPurchase = await CoursePurchase.create({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      razorpayOrderId: order.id,
    });

    return res.status(200).json({
  success: true,
  order: order,       // send the full order object
  key: process.env.RAZORPAY_API_KEY, // public key
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating Razorpay order" });
  }
};
import crypto from "crypto";

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Update purchase record
    const updatedPurchase = await CoursePurchase.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId },
      { status: "completed", razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    if (!updatedPurchase) {
      return res.status(404).json({ success: false, message: "Purchase record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      courseId: updatedPurchase.courseId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};


export const getCourseDetailWithPurchaseStatus = async (req,res) => {
      try {
            const {courseId} = req.params
            const userId = req.id

            const course = await Course.findById(courseId).populate({path:"creator"}).populate({path:"lectures"})

            const purchased = await CoursePurchase.findOne({
                  userId,
                  courseId,
                  // status:"completed"
            })

            if(!course) {
                  return res.status(404).json({
                        message:"Course not found"
                  })
            }
            return res.status(200).json({
                  course,
                  purchased: !!purchased, // true if purchased , false otherwise
            })
      } catch (error) {
            console.log(error);
            
      }
}

export const getAllPurchasedCourse = async (_,res) => {
      try {
            const purchasedCourse = await CoursePurchase.find({status:"completed"}).populate("courseId")
            if(!purchasedCourse) {
                  return res.status(404).json({
                        purchasedCourse:[]
                  })
            }
            return res.status(200).json({
                  purchasedCourse,
            })
      } catch (error) {
            console.log(error);
            
      }
}