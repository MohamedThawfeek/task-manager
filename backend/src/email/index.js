const nodemailer = require("nodemailer");

const {
  Forgotpassword,
  Passwordresetsuccess,
  Registrationwelcome,
} = require("../utils/html/html");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_APP_PASSWORD}`,
  },
});

const getPdfAttachment = (attachment) => {
  if (Buffer.isBuffer(attachment)) {
    return { content: attachment };
  }

  if (typeof attachment === "string") {
    return { href: new URL(attachment).href };
  }

  throw new TypeError("Email attachment must be a PDF buffer or URL.");
};

const EmailSend = async ({ toEmail, subject, attachments, html }) => {
  try {
    const mailOptions = {
      from: `"TASK-MANAGER" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      ...(html && { html: html }),
      ...(attachments && {
        attachments: [
          {
            filename: "offer_letter.pdf",
            ...getPdfAttachment(attachments),
            contentType: "application/pdf",
            contentDisposition: "attachment",
          },
        ],
      }),
    };
    await transport.sendMail(mailOptions);
    return {
      success: true,
      response: 200,
    };
  } catch (error) {
    console.error("Email sending error:", error.message);
    return {
      success: false,
      response: 400,
    };
  }
};

exports.ForgotPassword = async ({
  toEmail,
  expiresIn,
  name,
  resetUrl,
  supportEmail,
}) => {
  try {
    await EmailSend({
      toEmail: toEmail,
      subject: `Forgot Password`,
      html: await Forgotpassword({ name, resetUrl, expiresIn, supportEmail }),
    });

    console.log("✅ Forgot Password!");
  } catch (error) {
    console.error("Invoice generation error:", error);
    return {
      success: false,
      response: 400,
    };
  }
};

exports.PasswordresetSuccess = async ({
  toEmail,
  name,
  loginUrl,
  supportEmail,
}) => {
  try {
    await EmailSend({
      toEmail: toEmail,
      subject: `Reset Password Success`,
      html: await Passwordresetsuccess({ name, loginUrl, supportEmail }),
    });

    console.log("✅ Reset Password Success!");
  } catch (error) {
    console.error("Invoice generation error:", error);
    return {
      success: false,
      response: 400,
    };
  }
};

exports.RegistrationWelcome = async ({
  toEmail,
  name,
  loginUrl,
  supportEmail,
  logoUrl,
  appName,
  password,
}) => {
  try {
    await EmailSend({
      toEmail: toEmail,
      subject: `Registration`,
      html: await Registrationwelcome({
        name,
        email: toEmail,
        password,
        appName,
        supportEmail,
        logoUrl,
        loginUrl,
      }),
    });

    console.log("✅ Registration Success!");
  } catch (error) {
    console.error("Invoice generation error:", error);
    return {
      success: false,
      response: 400,
    };
  }
};
