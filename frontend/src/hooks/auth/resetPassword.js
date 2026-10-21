import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetSchema } from "../../validations/auth";
import Formhandel from "../../components/formik/FormikFields";
import api from "../../service/axios";
import { apiPath } from "../../service/path";

const useResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetToken = searchParams.get("token") || "";

  const initialValue = {
    password: "",
    confirm: "",
  };

  const handleReset = async (values) => {
    if (!resetToken) {
      toast.error("This reset link is missing its token");
      return;
    }

    setLoading(true);
    try {
      const result = await api.put(
        apiPath.resetPassword,
        { token: resetToken, password: values.password },
        "Unable to reset the password",
      );
      toast.success(result.message || "Password reset successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to reset the password");
    } finally {
      setLoading(false);
    }
  };

  const form = Formhandel({
    initialValue,
    schema: resetSchema,
    submitFunction: handleReset,
  });

  return {
    ...form,
    loading,
    resetToken,
    showPassword,
    setShowPassword,
  };
};

export default useResetPassword;
