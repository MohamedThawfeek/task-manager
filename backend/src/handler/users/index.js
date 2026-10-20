const { User } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailQueue = require("../../utils/queue");
const { fileToBase64 } = require("../../utils/image");
const {
  ForgotPassword,
  PasswordresetSuccess,
  RegistrationWelcome,
} = require("../../email");

exports.userRegister = async (req, res) => {
  try {
    const { name, email, password, phone, role, access, status } = req.body;
    const { profile } = req.files || {};

    let profileBuffer;

    if (profile) {
      profileBuffer = await fileToBase64(profile);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = {
      name,
      email,
      password: hashedPassword,
      ...(profileBuffer && { profile: profileBuffer }),
      phone,
      role,
      access,
      status,
    };

    const user = await User.create(payload);

    emailQueue.add(() =>
      RegistrationWelcome({
        toEmail: user.email,
        name: user.name,
        appName: "TASK MANAGER",
        supportEmail: "support@taskmanager.com",
        loginUrl: `${process.env.BASE_URL}/login`,
        password: password,
      }),
    );

    return {
      status: true,
      responseCode: 201,
      message: "User created successfully",
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

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    if (user && user.password === null) {
      return {
        status: false,
        responseCode: 404,
        message: "Please register your account",
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        status: false,
        responseCode: 401,
        message: "Invalid password",
      };
    }

    const generateToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      status: true,
      responseCode: 200,
      message: "User logged in successfully",
      token: generateToken,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to login user",
      db_error: error,
    };
  }
};

exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { name, role, phone } = req.body;
  const { profile } = req.files || {};
  try {
    const user = await User.findById(id);
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    let profileBuffer;

    if (profile) {
      profileBuffer = await fileToBase64(profile);
    }

    let hashedPassword;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const payload = {
      name,
      ...(profileBuffer && { profile: profileBuffer }),
      phone,
      role,
    };

    await User.findByIdAndUpdate(id, payload);

    if (password) {
      emailQueue.add(() =>
        PasswordresetSuccess({
          toEmail: user.email,
          name: user.name,
          loginUrl: `${process.env.BASE_URL}/login`,
          supportEmail: "info@taskmanager.com",
        }),
      );
    }
    return {
      status: true,
      responseCode: 200,
      message: "User updated successfully",
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

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    emailQueue.add(() =>
      PasswordresetSuccess({
        toEmail: user.email,
        name: user.name,
        loginUrl: `${process.env.BASE_URL}/login`,
        supportEmail: "info@taskmanager.com",
      }),
    );
    return {
      status: true,
      responseCode: 200,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to update password",
      db_error: error,
    };
  }
};

exports.getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    if (user && user.password === null) {
      return {
        status: false,
        responseCode: 404,
        message: "Please register your account",
      };
    }

    return {
      status: true,
      responseCode: 200,
      message: "User found successfully",
      user,
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    if (user && user.password === null) {
      return {
        status: false,
        responseCode: 404,
        message: "Please register your account",
      };
    }

    const generateToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    emailQueue.add(() =>
      ForgotPassword({
        toEmail: user.email,
        name: user.name,
        resetUrl: `${process.env.BASE_URL}/reset-password?token=${generateToken}`,
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    if (user && user.password === null) {
      return {
        status: false,
        responseCode: 404,
        message: "Please register your account",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    emailQueue.add(() =>
      PasswordresetSuccess({
        toEmail: user.email,
        name: user.name,
        loginUrl: `${process.env.BASE_URL}/login`,
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

exports.deleteUser = async (req, res) => {
  const { id } = req;
  try {
    const user = await User.findById(id);
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    await User.findByIdAndDelete(id);
    return {
      status: true,
      responseCode: 200,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to delete user",
      db_error: error,
    };
  }
};
