import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotSchema } from "../../validations/auth";
import Formhandel from "../../components/formik/FormikFields";
import api from "../../service/axios";
import { apiPath } from "../../service/path";

const useForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValue = {
    email: "",
  };

  const handleForgot = async (values) => {
    setLoading(true);
    try {
      const result = await api.post(
        apiPath.forgotPassword,
        { email: values.email },
        "Unable to send the reset link",
      );
      toast.success(result.message || "Password reset link sent");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Unable to send the reset link");
    } finally {
      setLoading(false);
    }
  };

  const form = Formhandel({
    initialValue,
    schema: forgotSchema,
    submitFunction: handleForgot,
  });

  return { ...form, loading };
};

export default useForgotPassword;
