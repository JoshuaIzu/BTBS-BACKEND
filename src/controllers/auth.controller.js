const User = require("../models/user.model");
const Business = require("../models/business.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateotp");
const sendEmail = require("../utils/sendEmail");
const sendEmailBackground = require("../utils/sendEmailBackground");

const registerCommuter = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === "business") {
        return res.status(400).json({
          message: "An account with this email already exists as a business. Please use a different email or contact support."
        });
      }
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
      if (existingUser.role === "commuter") {
        return res.status(400).json({
          message: "An account with this email already exists as a commuter. Please use a different email or contact support."
        });
      }
      return res.status(400).json({ message: "Business already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { otp, otpExpiresAt } = generateOTP();

    const user = await User.create({
      businessName,
      email,
      password: hashedPassword,
      category,
      role: "business",
      otp,
      otpExpiry: otpExpiresAt,
    });

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const business = await Business.create({
      ownerId: user._id,
      businessName,
      category,
      trialStartDate: new Date(),
      trialEndDate,
      subscriptionStatus: "trial"
    })

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
        subscriptionStatus: business.subscriptionStatus,
        trialEndDate: business.trialEndDate,
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

    // background email sending
    sendEmailBackground(
      email,
      "BTBS Sign-In OTP",
      `Your sign-in OTP is ${otp}. It expires at ${otpExpiresAt.toLocaleString()}.`,
      {
        template: "otp-login.ejs",
        data: {
          name: user.fullName || user.businessName,
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
  const { email, password, expectedRole } = req.body;

  try {
    if (!email || !password || !expectedRole) {
      return res.status(400).json({
        message: "Email, password and account type are required",
      });
    }

    if (!["commuter", "business"].includes(expectedRole)) {
      return res.status(400).json({
        message: "Invalid account type",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // VERY IMPORTANT
    // Make sure the selected path matches the actual account
    if (user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message:
          expectedRole === "commuter"
            ? "This account is registered as a vendor. Please use the vendor login."
            : "This account is registered as a commuter. Please use the commuter login.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, user.role);

    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token,
    };

    return res.status(200).json({
      message: "Login successful",
      user: userResponse,
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      const { otp, otpExpiresAt } = generateOTP();

      user.resetPasswordOtp = otp;
      user.resetPasswordOtpExpiry = otpExpiresAt;

      await user.save();

      // Send email in background - don't block response
      sendEmailBackground(
        email,
        "BTBS Password Reset OTP",
        `Your BTBS password reset OTP is ${otp}.

This OTP expires at ${otpExpiresAt.toLocaleString()}.

If you did not request a password reset, please ignore this email.`
      );
    }

    return res.status(200).json({
      success: true,
      message: "If the email exists, a password reset OTP has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Error processing password reset request",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new OTP.",
      });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtpExpiry < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;

    await user.save();

    // Send confirmation email in background
    sendEmailBackground(
      email,
      "BTBS Password Reset Successful",
      `Your BTBS password has been successfully reset.

If you did not initiate this change, please contact support immediately.`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found",
      });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtpExpiry < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });

  } catch (error) {
    console.error("Verify reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message
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
  forgotPassword,
  resetPassword,
  verifyResetOtp,
};
