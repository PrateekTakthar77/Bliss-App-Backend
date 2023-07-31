const { EmailBody } = require("./EmailMessages");

const emailMessageGenerator = (to, otp, name) => {
  console.log(to);
  const msg = {
    to: to, // recipient
    from: "Sachin@januskoncepts.in",
    subject: "Your One-Time Password (OTP) for verification",
    text: EmailBody.otpBody(otp, name),
  };
  return msg;
};

module.exports = { emailMessageGenerator };
