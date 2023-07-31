//project_directory/emailBuilder.js

var SibApiV3Sdk = require("sib-api-v3-sdk");
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = "my-api-key";

new SibApiV3Sdk.TransactionalEmailsApi()
  .sendTransacEmail({
    subject: "Hello from the Node SDK!",
    sender: { email: "api@sendinblue.com", name: "Sendinblue" },
    replyTo: { email: "api@sendinblue.com", name: "Sendinblue" },
    to: [{ name: "John Doe", email: "mydokarma@gmail.com" }],
    htmlContent:
      "<html><body><h1>This is a transactional email {{params.bodyMessage}}</h1></body></html>",
    params: { bodyMessage: "Made just for you!" },
  })
  .then(
    function (data) {
      console.log("API called successfully. Returned data: " + data);
    },
    function (error) {
      console.error(error);
      console.error("Error sending OTP email:", error);
    }
  );
