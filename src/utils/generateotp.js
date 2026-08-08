const generateOTP = () => {
  const otp = Math.floor(
    100000 + Math.random() * 900000
).toString();

const otpExpiresAt = new Date(
    Date.now() + 5 * 60 * 1000
); // OTP expires in 5 minutes


return { otp, otpExpiresAt };
};

module.exports = generateOTP;