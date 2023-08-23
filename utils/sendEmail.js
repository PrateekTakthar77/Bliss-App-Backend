const { createTransport } = require("nodemailer");
const sendEmail = async (to, subject, text) => {
    const transpoter = createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "80d9c4c672d0c4",
            pass: "95e933cdfeb075"
        }
    });
    await transpoter.sendMail({
        to,
        subject,
        text,
        from: "jewelleryBliss@gmail.com"
    });

}

module.exports = sendEmail;