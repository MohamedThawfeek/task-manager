const { Admin } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailQueue = require("../../utils/queue");
const { ForgotPassword, PasswordresetSuccess } = require("../../email");

exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashedPassword });

    return {
      status: true,
      responseCode: 201,
      message: "Admin created successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to create admin",
      db_error: error,
    };
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return {
        status: false,
        responseCode: 404,
        message: "Admin not found",
      };
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return {
        status: false,
        responseCode: 401,
        message: "Invalid password",
      };
    }

    const generateToke = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      status: true,
      responseCode: 200,
      message: "Admin logged in successfully",
      token: generateToke,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to login admin",
      db_error: error,
    };
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email }).lean();
    if (!admin) {
      return {
        status: false,
        responseCode: 404,
        message: "Admin not found",
      };
    }

    const generateToke = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    emailQueue.add(() =>
      ForgotPassword({
        toEmail: admin.email,
        name: admin.name,
        resetUrl: `${process.env.BASE_URL}/admin/reset-password?token=${generateToke}`,
        expiresIn: "Expires in 15 minutes",
        appName: "TASK MANAGER",
        supportEmail: "info@taskmanager.com",
      }),
    );

    return {
      status: true,
      responseCode: 200,
      message: "OTP sent successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to send OTP",
      db_error: error,
    };
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return {
        status: false,
        responseCode: 404,
        message: "Admin not found",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    await admin.save();

    emailQueue.add(() =>
      PasswordresetSuccess({
        toEmail: admin.email,
        name: admin.name,
        loginUrl: `${process.env.BASE_URL}/admin/login`,
        supportEmail: "info@taskmanager.com",
      }),
    );
    return {
      status: true,
      responseCode: 200,
      message: "Password reset successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to reset password",
      db_error: error,
    };
  }
};

exports.getAdminProfile = async (req, res) => {
  const { id } = req;
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return {
        status: false,
        responseCode: 404,
        message: "Admin not found",
      };
    }
    return {
      status: true,
      responseCode: 200,
      message: "Admin found successfully",
      admin,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to find admin",
      db_error: error,
    };
  }
};
