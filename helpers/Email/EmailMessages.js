const EmailBody = {
  otpBody: (otp, name) => {
    return `Hi ${name},

We are sending you this email to verify your account on our website.

Your one-time password (OTP) is: ${otp}

Please enter this OTP in the OTP field on the login page to complete your registration.

This OTP is valid for 10 minutes.

If you did not create an account on our website, please disregard this email.

Thank you,
Incredible devs Team`;
  },
};

module.exports = { EmailBody };
