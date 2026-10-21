import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Formhandel from "../../components/formik/FormikFields";
import { taskSchema } from "../../validations/forms";
import { selectTaskState, setTaskDetailLoading, setTaskDetails, setTaskError, setTaskSubmitting } from "../../redux/slice/task";
import { selectProjects, setProjects } from "../../redux/slice/project";
import { selectTeamRows, setTeamRows } from "../../redux/slice/team";
import api from "../../service/axios";
import { apiPath } from "../../service/path";
import {
  formatProject,
  formatUser,
  makeTaskFormData,
  normalizeTask,
} from "../../utils/apiData";
import { getTaskAssigneeIds, getTaskStatusId } from "../../utils/tasks";

export default function useTaskForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const taskState = useSelector(selectTaskState);
  const projects = useSelector(selectProjects);
  const team = useSelector(selectTeamRows);
  const access = useSelector((state) => state.auth.user?.access || "User");
  const initialTask = id ? taskState.items.find((task) => task.id === id) : null;
  const fetchedTaskId = useRef("");
  const [checklistDraft, setChecklistDraft] = useState(null);
  const [checkText, setCheckText] = useState("");
  const [attachmentDraft, setAttachmentDraft] = useState(null);
  const checklist = checklistDraft ?? initialTask?.checklist ?? [];
  const attachments = attachmentDraft ?? initialTask?.attachments ?? [];

  useEffect(() => {
    const loadProjects = async () => {
      const url = String(access).toLowerCase() === "admin"
        ? apiPath.projects
        : apiPath.userProjects;
      const response = await api.get(url, "Unable to load projects");
      const rows = (Array.isArray(response.projects) ? response.projects : [])
        .map(formatProject);
      dispatch(setProjects(rows));
    };

    const loadUsers = async () => {
      const response = await api.get(apiPath.users, "Unable to load users");
      const rows = (Array.isArray(response.users) ? response.users : [])
        .map(formatUser);
      dispatch(setTeamRows(rows));
    };

    loadProjects().catch((error) => dispatch(setTaskError(error.message)));
    loadUsers().catch(() => undefined);
  }, [access, dispatch]);

  useEffect(() => {
    if (!id || fetchedTaskId.current === id) return;
    fetchedTaskId.current = id;
    dispatch(setTaskDetailLoading(true));
    dispatch(setTaskError(""));
    api.post(
      apiPath.task,
      { task_id: id },
      "Unable to load the task",
    )
      .then((response) => normalizeTask({
        ...response.data?.task,
        task_id: id,
        comments: response.data?.comments || [],
      }, initialTask || {}))
      .then((task) => dispatch(setTaskDetails(task)))
      .catch((error) => dispatch(setTaskError(error.message || "Unable to load the task")))
      .finally(() => dispatch(setTaskDetailLoading(false)));
  }, [dispatch, id, initialTask]);

  const saveTask = async (values) => {
    const statusId = getTaskStatusId(projects, values.projectId, values.status, values.status === initialTask?.status ? initialTask?.statusId : "");
    if (!statusId) {
      toast.error("Select a project with an available task status");
      return;
    }

    dispatch(setTaskSubmitting(true));
    dispatch(setTaskError(""));
    try {
      const payload = { ...values, ...(initialTask && { id: initialTask.id }), statusId, checklist, attachments };
      const result = initialTask
        ? await api.put(
            apiPath.updateTask,
            makeTaskFormData(payload, true),
            "Unable to update the task",
          )
        : await api.post(
            apiPath.createTask,
            makeTaskFormData(payload),
            "Unable to create the task",
          );
      const savedTask = normalizeTask(result.task || {}, payload);
      dispatch(setTaskDetails(savedTask));
      toast.success(result.message || (initialTask ? "Task updated" : "Task created"));
      navigate(`/tasks/${savedTask.id}`);
    } catch (error) {
      dispatch(setTaskError(error.message || "Unable to save the task"));
      toast.error(error.message || "Unable to save the task");
    } finally {
      dispatch(setTaskSubmitting(false));
    }
  };

  const form = Formhandel({
    initialValue: {
      title: initialTask?.title || "",
      projectId: initialTask?.projectId || params.get("project") || "",
      priority: initialTask?.priority || "Medium",
      status: initialTask?.status || params.get("status") || "To Do",
      dueDate: initialTask?.dueDate || "",
      description: initialTask?.description || "",
      assigneeIds: getTaskAssigneeIds(initialTask),
    },
    schema: taskSchema,
    submitFunction: saveTask,
    enableReinitialize: true,
  });

  const addChecklistItem = () => {
    if (!checkText.trim()) return;
    setChecklistDraft((items) => [...(items ?? initialTask?.checklist ?? []), { id: `c-${Date.now()}`, title: checkText.trim(), completed: false }]);
    setCheckText("");
  };

  const removeChecklistItem = (itemId) => setChecklistDraft((items) => (items ?? initialTask?.checklist ?? []).filter((item) => item.id !== itemId));

  const uploadAttachments = (event) => {
    Array.from(event.target.files).slice(0, 3).forEach((file) => {
      if (file.size > 1_500_000) {
        toast.error(`${file.name} is larger than 1.5 MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setAttachmentDraft((items) => [...(items ?? initialTask?.attachments ?? []), { id: `a-${Date.now()}-${file.name}`, name: file.name, type: file.type, url: reader.result, file }]);
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  const removeAttachment = (attachmentId) => setAttachmentDraft((items) => (items ?? initialTask?.attachments ?? []).filter((item) => item.id !== attachmentId));

  return {
    id,
    initialTask,
    projects,
    team,
    form,
    checklist,
    checkText,
    setCheckText,
    addChecklistItem,
    removeChecklistItem,
    attachments,
    uploadAttachments,
    removeAttachment,
    isLoading: taskState.detailLoading,
    error: taskState.error,
  };
}
