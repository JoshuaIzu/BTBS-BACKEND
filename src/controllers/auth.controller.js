const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateotp");
const sendEmail = require("../utils/sendEmail");

const registerCommuter = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { otp, otpExpiresAt } = generateOTP();

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "commuter",
      otp,
      otpExpiry: otpExpiresAt,
      isVerified: false,
    });

    sendEmail(
      email,
      "BTBS Registration OTP",
      `Your registration OTP is ${otp}. It expires at ${otpExpiresAt.toLocaleString()}.`,
      {
        template: "otp-register.ejs",
        data: {
          name: fullName,
          otp,
          expiresAt: otpExpiresAt.toLocaleString(),
        },
      },
    );

    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    };
    res.status(201).json({
      message: "User registered successfully. OTP email sent.",
      user: userResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

const registerBusiness = async (req, res) => {
  try {
    const { businessName, email, password, category } = req.body;

    if (!businessName || !email || !password || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Business already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { otp, otpExpiresAt } = generateOTP();

    const business = await User.create({
      businessName,
      email,
      password: hashedPassword,
      category,
      role: "business",
      otp,
      otpExpiry: otpExpiresAt,
    });

    sendEmail(
      email,
      "BTBS Registration OTP",
      `Your registration OTP is ${otp}. It expires at ${otpExpiresAt.toLocaleString()}.`,
      {
        template: "otp-register.ejs",
        data: {
          name: businessName,
          otp,
          expiresAt: otpExpiresAt.toLocaleString(),
        },
      },
    );

    res.status(201).json({
      success: true,
      message: "Business registered successfully. OTP sent.",
      user: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        category: business.category,
        role: business.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering business",
      error: error.message,
    });
  }
};

const sendLoginOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before requesting a login OTP",
      });
    }

    const { otp, otpExpiresAt } = generateOTP();
    user.otp = otp;
    user.otpExpiry = otpExpiresAt;
    await user.save();

    sendEmailNoWait(
      email,
      "BTBS Sign-In OTP",
      `Your sign-in OTP is ${otp}. It expires at ${otpExpiresAt.toLocaleString()}.`,
      {
        template: "otp-login.ejs",
        data: {
          name: user.fullName,
          otp,
          expiresAt: otpExpiresAt.toLocaleString(),
        },
      },
    );

    res.json({ message: "Login OTP sent to your email address" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending login OTP", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id, user.role);

    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token,
    };

    res.json({ message: "Login successful", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const profile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Account already verified",
      });
    }

    const { otp, otpExpiresAt } = generateOTP();
    user.otp = otp;
    user.otpExpiry = otpExpiresAt;
    await user.save();

    sendEmail(
      email,
      "BTBS Registration OTP",
      `Your registration OTP is ${otp}. It expires at ${otpExpiresAt.toLocaleString()}.`,
      {
        template: "otp-register.ejs",
        data: {
          name: user.fullName,
          otp,
          expiresAt: otpExpiresAt.toLocaleString(),
        },
      },
    );

    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resending OTP",
      error: error.message,
    });
  }
};

module.exports = {
  registerCommuter,
  registerBusiness,
  sendLoginOtp,
  loginUser,
  profile,
  verifyOtp,
  resendOtp,
};
