import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deleteTask as removeTaskFromStore,
  selectTaskState,
  setCommentSubmitting,
  setCommentsLoading,
  setTaskComments,
  setTaskDeleting,
  setTaskDetailLoading,
  setTaskDetails,
  setTaskError,
  setTodoUpdating,
  toggleChecklist,
} from "../../redux/slice/task";
import { selectProjects } from "../../redux/slice/project";
import { selectTeamRows } from "../../redux/slice/team";
import api from "../../service/axios";
import { apiPath } from "../../service/path";
import { formatComment, normalizeTask } from "../../utils/apiData";
import { getTaskAssignees } from "../../utils/tasks";

export default function useTaskDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const taskState = useSelector(selectTaskState);
  const projects = useSelector(selectProjects);
  const team = useSelector(selectTeamRows);
  const [comment, setComment] = useState("");
  const [confirm, setConfirm] = useState(false);
  const fetchedTaskId = useRef("");
  const fetchedCommentsTaskId = useRef("");
  const task = taskState.items.find((item) => item.id === id);
  const project = projects.find((item) => item.id === task?.projectId);
  const storedAssignees = task ? getTaskAssignees(task, team) : [];
  const assignees = storedAssignees.length ? storedAssignees : task?.assignees || [];
  const complete = task?.checklist.filter((item) => item.completed).length || 0;
  const percent = task?.checklist.length ? Math.round((complete / task.checklist.length) * 100) : 0;

  const loadTask = useCallback(async (fallback) => {
    dispatch(setTaskDetailLoading(true));
    dispatch(setTaskError(""));
    try {
      const response = await api.post(
        apiPath.task,
        { task_id: id },
        "Unable to load the task",
      );
      const details = normalizeTask({
        ...response.data?.task,
        task_id: id,
        comments: response.data?.comments || [],
      }, fallback || {});
      dispatch(setTaskDetails(details));
      return details;
    } catch (error) {
      dispatch(setTaskError(error.message || "Unable to load the task"));
      throw error;
    } finally {
      dispatch(setTaskDetailLoading(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!id || fetchedTaskId.current === id) return;
    fetchedTaskId.current = id;
    loadTask(task).catch(() => undefined);
  }, [id, loadTask, task]);

  const loadComments = useCallback(async () => {
    if (!id) return [];
    dispatch(setCommentsLoading(true));
    try {
      const response = await api.get(
        apiPath.comments,
        "Unable to load comments",
        { params: { task_id: id } },
      );
      const comments = (Array.isArray(response.commands) ? response.commands : [])
        .map(formatComment);
      dispatch(setTaskComments({ taskId: id, comments }));
      return comments;
    } finally {
      dispatch(setCommentsLoading(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!id || !task || fetchedCommentsTaskId.current === id) return;
    fetchedCommentsTaskId.current = id;
    loadComments().catch((error) => toast.error(error.message || "Unable to load comments"));
  }, [id, loadComments, task]);

  const sendComment = async () => {
    const command = comment.trim();
    if (!command || taskState.commentSubmitting) return;
    dispatch(setCommentSubmitting(true));
    try {
      const result = await api.post(
        apiPath.createComment,
        { task_id: id, command },
        "Unable to add the comment",
      );
      setComment("");
      await loadComments();
      toast.success(result.message || "Comment added");
    } catch (error) {
      toast.error(error.message || "Unable to add the comment");
    } finally {
      dispatch(setCommentSubmitting(false));
    }
  };

  const toggleChecklistItem = async (itemId) => {
    const item = task?.checklist.find((entry) => entry.id === itemId);
    if (!item || taskState.todoUpdating) return;
    dispatch(toggleChecklist({ taskId: id, itemId }));
    dispatch(setTodoUpdating(true));
    try {
      const result = await api.put(
        apiPath.updateTodoStatus,
        { task_id: id, todo_id: itemId, completed: !item.completed },
        "Unable to update the checklist item",
      );
      await loadTask({ ...task, checklist: task.checklist.map((entry) => entry.id === itemId ? { ...entry, completed: !entry.completed } : entry) });
      toast.success(result.message || "Checklist updated");
    } catch (error) {
      dispatch(toggleChecklist({ taskId: id, itemId }));
      toast.error(error.message || "Unable to update the checklist");
    } finally {
      dispatch(setTodoUpdating(false));
    }
  };

  const removeTask = async () => {
    dispatch(setTaskDeleting(true));
    try {
      const result = await api.delete(
        apiPath.deleteTask,
        { task_id: id },
        "Unable to delete the task",
      );
      dispatch(removeTaskFromStore(id));
      toast.success(result.message || "Task deleted");
      navigate("/tasks");
    } catch (error) {
      toast.error(error.message || "Unable to delete the task");
    } finally {
      dispatch(setTaskDeleting(false));
    }
  };

  return {
    id,
    navigate,
    task,
    project,
    assignees,
    complete,
    percent,
    comment,
    setComment,
    confirm,
    setConfirm,
    sendComment,
    toggleChecklistItem,
    removeTask,
    isLoading: taskState.detailLoading,
    isDeleting: taskState.deleting,
    isUpdatingTodo: taskState.todoUpdating,
    isLoadingComments: taskState.commentsLoading,
    isSendingComment: taskState.commentSubmitting,
    error: taskState.error,
  };
}
