const projectColors = [
  "#5b4bff",
  "#2d86f5",
  "#19b97a",
  "#ff496c",
  "#f6a91b",
  "#8061ff",
];

const defaultStatuses = ["To Do", "In Progress", "Review", "Done"];

export function getId(item) {
  return String(
    item?._id ||
      item?.id ||
      item?.task_id ||
      item?.user_id ||
      item ||
      "",
  );
}

function toTitleCase(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export function formatUser(user = {}) {
  const name = user.name || user.email?.split("@")[0] || "Unnamed User";

  return {
    ...user,
    id: getId(user),
    name,
    phone: user.phone || "",
    role: user.role || "Team Member",
    access: user.access || "User",
    status: user.status || "Active",
    jobTitle: user.role || user.jobTitle || "",
    avatar:
      user.profile ||
      user.avatar ||
      name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
  };
}

function getMembers(project) {
  if (Array.isArray(project?.project_access)) return project.project_access;
  if (Array.isArray(project?.members)) return project.members;
  return [];
}

function getStatuses(project) {
  if (Array.isArray(project?.board_status)) return project.board_status;
  if (Array.isArray(project?.statuses)) return project.statuses;
  return [];
}

function getProjectColor(project, index) {
  const id = getId(project);
  const colorIndex = [...id].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return project?.color || projectColors[(colorIndex || index) % projectColors.length];
}

export function formatProject(project, index = 0) {
  const members = getMembers(project).map(formatUser);
  const statuses = getStatuses(project)
    .map((status, statusIndex) => ({
      id: getId(status),
      name:
        status?.status_type === "To DO"
          ? "To Do"
          : toTitleCase(
              status?.status_type ||
                status?.name ||
                defaultStatuses[statusIndex],
            ),
      color: status?.color || null,
    }))
    .filter((status) => status.id);
  const storedMemberIds = Array.isArray(project?.memberIds)
    ? project.memberIds.map(getId)
    : [];

  return {
    ...project,
    id: getId(project),
    name: project?.name || "Untitled project",
    description: project?.description || "",
    status: toTitleCase(project?.status || "active"),
    progress: Number(project?.progress) || 0,
    dueDate: project?.due_date || project?.dueDate || "",
    createdAt: project?.created_at || project?.createdAt || "",
    memberIds: members.length
      ? members.map((member) => member.id)
      : storedMemberIds,
    members,
    statuses,
    taskCount: Number(project?.task_count ?? project?.taskCount ?? 0),
    color: getProjectColor(project, index),
  };
}

export function makeProjectBody(project, isEdit = false) {
  const body = {
    name: project.name.trim(),
    description: project.description?.trim() || "",
    status: String(project.status || "Active").toLowerCase(),
    progress: Number(project.progress) || 0,
    due_date: project.dueDate,
    users: project.memberIds,
  };

  if (isEdit) body.project_id = project.id;
  return body;
}

export function formatProjectTask(task, projectId) {
  const assignedUsers = Array.isArray(task?.assigned_to)
    ? task.assigned_to
    : [];

  return {
    ...task,
    id: getId(task?.task_id || task),
    projectId,
    title: task?.title || "Untitled task",
    assigneeIds: assignedUsers.map(getId).filter(Boolean),
    status: task?.status === "To DO" ? "To Do" : task?.status || "To Do",
    priority: toTitleCase(task?.priority || "medium"),
    dueDate: task?.due_date || "",
    checklist: task?.todos || [],
    attachments: task?.attachments || [],
    comments: task?.comments || [],
  };
}

function formatStatusName(status = "") {
  const name = String(status).trim().toLowerCase();

  if (name === "to do") return "To Do";
  if (name === "in progress") return "In Progress";
  if (name === "review") return "Review";
  if (name === "done") return "Done";
  return status || "To Do";
}

function formatAttachment(attachment, index) {
  if (typeof attachment === "string") {
    return {
      id: `attachment-${index}`,
      name: `Attachment ${index + 1}`,
      url: attachment,
    };
  }

  return {
    ...attachment,
    id: getId(attachment) || `attachment-${index}`,
    name: attachment?.name || `Attachment ${index + 1}`,
    url: attachment?.url || attachment?.data || "",
  };
}

function formatChecklistItem(item, index) {
  return {
    ...item,
    id: getId(item) || `todo-${index}`,
    title: item?.title || "",
    completed: Boolean(item?.completed),
  };
}

export function formatComment(comment, index) {
  return {
    id: getId(comment) || `comment-${index}`,
    author:
      comment?.created_by?.name ||
      comment?.created_by ||
      comment?.author ||
      "Team member",
    text: comment?.command || comment?.text || "",
    createdAt: comment?.createdAt || comment?.created_at || "",
  };
}

function getTaskStatus(task, fallback) {
  let status = task?.status;
  let statusId = task?.status_id;

  if (typeof task?.status === "object") {
    status = task.status.status_type;
    statusId = task.status.status_id || task.status;
  } else if (typeof task?.status_id === "object") {
    status = task.status_id.status_type;
    statusId = task.status_id;
  }

  return {
    name: formatStatusName(status || fallback.status),
    id: getId(statusId) || fallback.statusId || "",
  };
}

export function normalizeTask(task, fallback = {}) {
  const project = task?.project || task?.project_id;
  const projectId =
    typeof project === "object"
      ? getId(project?.project_id || project)
      : getId(project);
  const projectName =
    typeof project === "object"
      ? project?.name
      : task?.projectName || "";
  const status = getTaskStatus(task, fallback);
  const assignedUsers = Array.isArray(task?.assigned_to)
    ? task.assigned_to
    : [];
  const checklist = Array.isArray(task?.todos)
    ? task.todos
    : task?.checklist || [];
  const attachments = Array.isArray(task?.attachments)
    ? task.attachments
    : [];
  const comments = Array.isArray(task?.comments) ? task.comments : [];
  const hasUserObjects = assignedUsers.some(
    (user) => typeof user === "object",
  );

  return {
    ...fallback,
    ...task,
    id: getId(task?.task_id || task) || fallback.id,
    title: task?.title || fallback.title || "Untitled task",
    description: task?.description || "",
    projectId: projectId || fallback.projectId || "",
    projectName: projectName || fallback.projectName || "",
    statusId: status.id,
    status: status.name,
    priority: task?.priority || fallback.priority || "Medium",
    dueDate: task?.due_date || task?.dueDate || fallback.dueDate || "",
    assigneeIds: assignedUsers.map(getId).filter(Boolean),
    assignees: hasUserObjects
      ? assignedUsers
          .filter((user) => typeof user === "object")
          .map(formatUser)
      : fallback.assignees || [],
    checklist: checklist.map(formatChecklistItem),
    attachments: attachments.map(formatAttachment),
    comments: comments.map(formatComment),
  };
}

export function makeTaskFormData(task, isEdit = false) {
  const formData = new FormData();

  if (isEdit) formData.append("task_id", task.id);
  formData.append("title", task.title.trim());
  formData.append("project_id", task.projectId);
  formData.append("status_id", task.statusId);
  formData.append("description", task.description?.trim() || "");
  formData.append("priority", task.priority);
  formData.append("due_date", task.dueDate);
  formData.append("assigned_to", JSON.stringify(task.assigneeIds || []));

  const checklist = (task.checklist || []).map((item) => ({
    title: item.title,
    completed: Boolean(item.completed),
  }));
  formData.append("todos", JSON.stringify(checklist));

  const savedAttachments = (task.attachments || [])
    .filter((attachment) => !attachment.file && attachment.url)
    .map((attachment) => attachment.url);
  formData.append("attachments", JSON.stringify(savedAttachments));

  for (const attachment of task.attachments || []) {
    if (attachment.file) formData.append("attachments", attachment.file);
  }

  return formData;
}

export function formatNotification(notification) {
  return {
    ...notification,
    id: getId(notification),
    title: notification?.name || notification?.project || "Notification",
    message: notification?.message || notification?.description || "",
    read: Boolean(notification?.read),
    createdAt: notification?.createdAt || "",
  };
}
