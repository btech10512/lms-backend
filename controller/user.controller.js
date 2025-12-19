import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
export const register = async (req, res) => {
  console.log(`Register API hit`, req.body);

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log(`API hit `);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    generateToken(res, user, `Welcome Back ${user.name}`);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login unsuccessful",
    });
  }
};

export const logout = async (_,res) => {
  try {
    return res.status(200).cookie("token","",{maxAge:0}).json({
      message:"Logged out successfully",
      success:true
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
}

export const getUserProfile = async (req,res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select(
      "-password"
    ).populate("enrolledCourses")
    if(!user) {
      return res.status(404).json({
        message:"User not found",
        success:false
      })
    }
    return res.status(200).json({
      success:true,
      user
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get load user",
    });
  }
}

export const updateProfile = async (req,res) => {
  try {
    const userId = req.id
    const {name} = req.body
    const profilePhoto = req.file

    const user = await User.findById(userId)
    if(!user) {
      return res.status(404).json({
        message:"User not found",
        success:false
      })
    }
//extract public id of the old image from the url if it exists
    if(user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop().split(".")[0]; // exttract public id
      deleteMediaFromCloudinary(publicId)
    }
    //now upload new photo 

    const cloudResponse = await uploadMedia(profilePhoto.path)
    const photoUrl = cloudResponse.secure_url

    const updatedData = {name,photoUrl}

    const updatedUser = await User.findByIdAndUpdate(userId,updatedData,{new:true}).select("-password")

    return res.status(200).json({
      success:true,
      user:updatedUser,
      message:"Profile updated successfully"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get update profile",
    });
  }
}