import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectTeamState,
  setTeamDeleting,
  setTeamError,
  setTeamLoading,
  setTeamRows,
  setTeamSubmitting,
} from "../../redux/slice/team";
import api from "../../service/axios";
import { apiPath } from "../../service/path";
import { formatUser } from "../../utils/apiData";
import toast from "react-hot-toast";
import Formhandel from "../../components/formik/FormikFields";
import { memberSchema } from "../../validations/forms";
import { useSelector } from "react-redux";

export default function useTeam() {
  const dispatch = useAppDispatch();
  const {
    rows,
    error,
    loading: isLoading,
    submitting: isSubmitting,
    deleting: isDeleting,
  } = useAppSelector(selectTeamState);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const access = useSelector((state) => state.auth.user?.access || "User");

  const loadTeam = useCallback(async () => {
    dispatch(setTeamLoading(true));
    dispatch(setTeamError(""));
    try {
      const response = await api.get(apiPath.users, "Unable to load users");
      const users = (Array.isArray(response.users) ? response.users : []).map(
        formatUser,
      );
      dispatch(setTeamRows(users));
      return users;
    } catch (error) {
      dispatch(setTeamError(error.message || "Unable to load users"));
      throw error;
    } finally {
      dispatch(setTeamLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadTeam().catch(() => undefined);
  }, [loadTeam]);

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setShowPassword(false);
  };
  const openCreate = () => {
    setEditing(null);
    setModal(true);
  };
  const openEdit = (member) => {
    setEditing(member);
    setModal(true);
  };
  const saveMember = async (data) => {
    dispatch(setTeamSubmitting(true));
    dispatch(setTeamError(""));
    try {
      let result;
      if (editing) {
        const payload = { id: editing.id, ...data };
        if (!payload.password) delete payload.password;
        result = await api.patch(
          apiPath.updateUser,
          payload,
          "Unable to update user",
        );
      } else {
        result = await api.post(
          apiPath.createUser,
          data,
          "Unable to create user",
        );
      }
      await loadTeam();
      toast.success(
        result.message ||
          (editing ? "User updated successfully" : "User created successfully"),
      );
      closeModal();
    } catch (error) {
      dispatch(setTeamError(error.message || "Unable to save user"));
      toast.error(error.message || "Unable to save user");
    } finally {
      dispatch(setTeamSubmitting(false));
    }
  };

  const normalizedStatus =
    editing?.status === "Inactive" ||
    String(editing?.status).toLowerCase() === "inactive"
      ? "Inactive"
      : "Active";

  const memberForm = Formhandel({
    initialValue: {
      name: editing?.name || "",
      email: editing?.email || "",
      password: "",
      phone: editing?.phone || "",
      role: editing?.role || "",
      access: editing?.access || "User",
      status: normalizedStatus,
    },
    schema: memberSchema(Boolean(editing)),
    submitFunction: saveMember,
    enableReinitialize: true,
  });
  const removeMember = async () => {
    if (!deleting) return;
    dispatch(setTeamDeleting(true));
    dispatch(setTeamError(""));
    try {
      const result = await api.delete(
        apiPath.deleteUser,
        { id: deleting.id },
        "Unable to delete user",
      );
      await loadTeam();
      setDeleting(null);
      toast.success(result.message || "User deleted successfully");
    } catch (error) {
      dispatch(setTeamError(error.message || "Unable to delete user"));
      toast.error(error.message || "Unable to delete user");
    } finally {
      dispatch(setTeamDeleting(false));
    }
  };

  return {
    team: rows,
    error,
    isLoading,
    isSubmitting,
    isDeleting,
    isMutating: isSubmitting || isDeleting,
    modal,
    editing,
    memberForm,
    showPassword,
    setShowPassword,
    deleting,
    setDeleting,
    loadTeam,
    openCreate,
    openEdit,
    closeModal,
    saveMember,
    removeMember,
    access,
  };
}
