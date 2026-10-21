import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { selectTaskState, setTaskError, setTaskListLoading, setTasks, updateTask as updateTaskInStore } from "../../redux/slice/task";
import { selectProjects, setProjects } from "../../redux/slice/project";
import { selectTeamRows, setTeamRows } from "../../redux/slice/team";
import api from "../../service/axios";
import { apiPath } from "../../service/path";
import { formatProject, formatUser, normalizeTask } from "../../utils/apiData";
import { getTaskAssignees, getTaskStatusId } from "../../utils/tasks";

export default function useTasks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const taskState = useSelector(selectTaskState);
  const tasks = taskState.items;
  const projects = useSelector(selectProjects);
  const team = useSelector(selectTeamRows);
  const access = useSelector((state) => state.auth.user?.access || "User");
  const [project, setProject] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("dueDate");

  const loadTasks = useCallback(async () => {
    dispatch(setTaskListLoading(true));
    dispatch(setTaskError(""));
    try {
      const url = String(access).toLowerCase() === "admin"
        ? apiPath.adminTasks
        : apiPath.userTasks;
      const response = await api.get(url, "Unable to load tasks");
      const groups = Array.isArray(response.data) ? response.data : [];
      const rows = groups.flatMap((group) => (group.tasks || []).map((task) => (
        normalizeTask({ ...task, status: task.status || group.status })
      )));
      dispatch(setTasks(rows));
      return rows;
    } catch (error) {
      dispatch(setTaskError(error.message || "Unable to load tasks"));
      throw error;
    } finally {
      dispatch(setTaskListLoading(false));
    }
  }, [access, dispatch]);

  useEffect(() => {
    loadTasks().catch(() => undefined);

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

    loadProjects().catch(() => undefined);
    loadUsers().catch(() => undefined);
  }, [access, dispatch, loadTasks]);

  const list = useMemo(() => tasks
    .filter((task) => (project === "All" || task.projectId === project) && task.title.toLowerCase().includes(query.toLowerCase()))
    .sort((first, second) => sort === "title" ? first.title.localeCompare(second.title) : String(first[sort] || "").localeCompare(String(second[sort] || ""))), [tasks, project, query, sort]);

  const dropTask = async (status, event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("taskId");
    const currentTask = tasks.find((item) => item.id === id);
    if (!currentTask || currentTask.status === status) return;

    const statusId = getTaskStatusId(projects, currentTask.projectId, status);
    if (!statusId) {
      toast.error("The selected project status is unavailable");
      return;
    }

    const movedTask = { ...currentTask, status, statusId };
    dispatch(updateTaskInStore(movedTask));
    try {
      const result = await api.put(
        apiPath.updateTaskStatus,
        { task_id: id, status_id: statusId },
        "Unable to update the task status",
      );
      toast.success(result.message || `Task moved to ${status}`);
    } catch (error) {
      dispatch(updateTaskInStore(currentTask));
      toast.error(error.message || "Unable to move the task");
    }
  };

  const projectName = (id, task) => projects.find((item) => item.id === id)?.name || task?.projectName || "";
  const taskAssignees = (task) => {
    const members = getTaskAssignees(task, team);
    return members.length ? members : task.assignees || [];
  };

  return {
    projects,
    list,
    project,
    setProject,
    query,
    setQuery,
    sort,
    setSort,
    navigate,
    dropTask,
    projectName,
    taskAssignees,
    loadTasks,
    isLoading: taskState.listLoading,
    error: taskState.error,
  };
}
