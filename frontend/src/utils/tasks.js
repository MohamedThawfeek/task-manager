export const getTaskAssigneeIds = (task) => {
  if (Array.isArray(task?.assigneeIds)) return task.assigneeIds
  return task?.assigneeId ? [task.assigneeId] : []
}

export const getTaskAssignees = (task, team) => getTaskAssigneeIds(task)
  .map((id) => team.find((member) => member.id === id))
  .filter(Boolean)
