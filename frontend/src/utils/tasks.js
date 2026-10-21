export const getTaskAssigneeIds = (task) => {
  if (Array.isArray(task?.assigneeIds)) return task.assigneeIds
  return task?.assigneeId ? [task.assigneeId] : []
}

export const getTaskAssignees = (task, team) => getTaskAssigneeIds(task)
  .map((id) => team.find((member) => member.id === id))
  .filter(Boolean)

export const getTaskStatusId = (projects, projectId, statusName, fallbackId = '') => {
  const project = projects.find((item) => item.id === projectId)
  const status = project?.statuses?.find((item) => item.name === statusName)
  return status?.id || fallbackId
}
