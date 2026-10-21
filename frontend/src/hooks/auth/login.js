import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSchema } from "../../validations/auth";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/slice/auth";
import Formhandel from "../../components/formik/FormikFields";
import api from "../../service/axios";
import { apiPath } from "../../service/path";
import { saveStoredAuth } from "../../service/authStorage";
import { formatUser } from "../../utils/apiData";

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialValue = {
    email: "",
    password: "",
    remember: false,
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const loginResult = await api.post(
        apiPath.login,
        { email: values.email, password: values.password },
        "Unable to sign in",
      );

      if (!loginResult.token) {
        throw new Error("The login response did not include a token");
      }

      let user = { email: values.email };

      try {
        const profileResult = await api.get(
          apiPath.profile,
          "Unable to load your profile",
          { headers: { Authorization: `Bearer ${loginResult.token}` } },
        );
        if (profileResult.user) user = formatUser(profileResult.user);
      } catch {
        // The login remains valid if the optional profile request fails.
      }

      const auth = {
        user,
        token: loginResult.token,
        remember: Boolean(values.remember),
        message: loginResult.message,
      };
      saveStoredAuth(auth);
      dispatch(setAuth(auth));
      toast.success(auth.message || "Login successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const form = Formhandel({
    initialValue,
    schema: loginSchema,
    submitFunction: handleLogin,
  });

  return {
    ...form,
    loading,
    showPassword,
    setShowPassword,
  };
};

export default useLogin;
