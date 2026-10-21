import dayjs from "dayjs";
import {
  CalendarDays,
  Columns3,
  Edit3,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Avatar,
  ConfirmModal,
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../components/common";
import { TaskForm } from "../components/forms";
import Dropdown from "../components/Dropdown";
import SearchInput from "../components/SearchInput";
import {
  useTaskDetailsPage,
  useTaskFormPage,
  useTasksPage,
} from "../hooks/task/useTasks";

const columns = [
  { name: "To Do", color: "#f0f3f9" },
  { name: "In Progress", color: "#eaf3ff" },
  { name: "Review", color: "#fff6e4" },
  { name: "Done", color: "#eaf8f2" },
];

export function TasksPage() {
  const {
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
    isLoading,
    error,
  } = useTasksPage();
  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Manage and track your tasks"
        action={
          <button
            className="primary-btn"
            onClick={() => navigate("/tasks/new")}
          >
            <Plus size={17} />
            Add Task
          </button>
        }
      />
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#ffd5dd] bg-[#fff2f5] px-4 py-3 text-sm text-[#d92f52]">
          <span>{error}</span>
          <button
            className="font-semibold"
            onClick={() => loadTasks().catch(() => undefined)}
          >
            Retry
          </button>
        </div>
      )}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="tab active flex w-fit items-center gap-2">
          <Columns3 size={16} />
          Board
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:ml-auto lg:w-auto">
          <Dropdown
            className="w-full sm:w-47.5"
            value={project}
            onChange={setProject}
            ariaLabel="Filter by project"
            options={[
              { label: "All Projects", value: "All" },
              ...projects.map((item) => ({ label: item.name, value: item.id })),
            ]}
          />
          <Dropdown
            className="w-full sm:w-45"
            value={sort}
            onChange={setSort}
            ariaLabel="Sort tasks"
            options={[
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
            ]}
          />
          <SearchInput
            className="w-full sm:w-60"
            value={query}
            onValueChange={setQuery}
            placeholder="Search tasks"
          />
        </div>
      </div>
      {isLoading && !list.length ? (
        <LoadingScreen />
      ) : (
        <div className="grid gap-3 overflow-x-auto pb-3 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <div
              key={col.name}
              className="kanban-col min-h-[540px]"
              style={{ background: col.color }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => dropTask(col.name, e)}
            >
              <div className="mb-4 flex items-center justify-between font-bold">
                <span>
                  {col.name}{" "}
                  <span className="text-xs font-normal text-muted">
                    {list.filter((t) => t.status === col.name).length}
                  </span>
                </span>
                <button
                  onClick={() =>
                    navigate(
                      `/tasks/new?status=${encodeURIComponent(col.name)}`,
                    )
                  }
                >
                  <Plus size={17} />
                </button>
              </div>
              <div className="space-y-3">
                {list
                  .filter((t) => t.status === col.name)
                  .map((task) => {
                    const assignees = taskAssignees(task);
                    return (
                      <article
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("taskId", task.id)
                        }
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="task-card cursor-grab"
                        key={task.id}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1.5 h-2.5 w-2.5 rounded-full ${task.priority === "High" ? "bg-[#ff496c]" : task.priority === "Medium" ? "bg-[#f6a91b]" : "bg-primary"}`}
                          />
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold">
                              {task.title}
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted">
                              {projectName(task.projectId)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between text-xs text-muted">
                          <span>▤ {dayjs(task.dueDate).format("MMM D")}</span>
                          <span
                            className="flex -space-x-2"
                            title={assignees
                              .map((assignee) => assignee.name)
                              .join(", ")}
                          >
                            {assignees.slice(0, 3).map((assignee) => (
                              <Avatar
                                key={assignee.id}
                                member={assignee}
                                size={25}
                                className="border-2 border-white"
                              />
                            ))}
                            {assignees.length > 3 && (
                              <span className="avatar h-[25px] w-[25px] border-2 border-white text-[9px]">
                                +{assignees.length - 3}
                              </span>
                            )}
                          </span>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function TaskFormPage() {
  const {
    id,
    initialTask,
    initial,
    projects,
    team,
    saveTask,
    isLoading,
    error,
  } = useTaskFormPage();
  if (id && isLoading) return <LoadingScreen />;
  if (id && !initialTask)
    return (
      <EmptyState
        title="Task not found"
        message={error || "The requested task could not be loaded."}
      />
    );
  return (
    <>
      <PageHeader
        title={initialTask ? "Edit Task" : "Create New Task"}
        subtitle={
          initialTask
            ? "Update task details and assignments"
            : "Add a new task and assign it to your team"
        }
      />
      <section className="card max-w-[1050px] p-6">
        <h2 className="mb-5 text-xl font-bold">
          {initialTask ? "Task Information" : "Create New Task"}
        </h2>
        <TaskForm
          initial={initial}
          projects={projects}
          team={team}
          onSubmit={saveTask}
          submitLabel={initialTask ? "Save Changes" : "Create Task"}
        />
      </section>
    </>
  );
}

export function TaskDetailsPage() {
  const {
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
    isLoading,
    isUpdatingTodo,
    error,
  } = useTaskDetailsPage();
  if (isLoading && !task) return <LoadingScreen />;
  if (!task)
    return (
      <div className="card">
        <EmptyState
          title="Task not found"
          message={error || "The requested task could not be loaded."}
          action={
            <button onClick={() => navigate("/tasks")} className="primary-btn">
              Back to tasks
            </button>
          }
        />
      </div>
    );
  return (
    <>
      <PageHeader
        title={task.title}
        subtitle={`Tasks › ${task.title}`}
        action={
          <div className="flex gap-2">
            <button
              className="secondary-btn text-[#ef476f]"
              onClick={() => setConfirm(true)}
            >
              <Trash2 size={17} />
            </button>
            <button
              className="primary-btn"
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              <Edit3 size={16} />
              Edit Task
            </button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(290px,1fr)]">
        <section className="card p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Status", task.status, <Columns3 key="status" />],
              ["Priority", task.priority, <FileText key="priority" />],
              [
                "Due Date",
                dayjs(task.dueDate).format("MMM D"),
                <CalendarDays key="date" />,
              ],
              [
                "Assignees",
                assignees
                  .map((assignee) => assignee.name.split(" ")[0])
                  .join(", ") || "Unassigned",
                <UserRound key="assignee" />,
              ],
            ].map(([label, value, icon]) => (
              <div
                key={label}
                className="flex min-h-[130px] min-w-0 items-center gap-4 rounded-xl border border-[#e2e7f1] p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eeecff] text-primary">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{label}</p>
                  <p className="mt-1 break-words text-xl font-bold leading-tight">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <h2 className="mt-7 text-xl font-bold">Description</h2>
          <p className="mt-4 leading-6">
            {task.description || "No description provided."}
          </p>
          <p className="mt-2 text-sm text-muted">
            Project: {project?.name || task.projectName || "—"}
          </p>
          <div className="mt-7 flex items-center gap-3">
            <h2 className="text-xl font-bold">
              Checklist ({complete}/{task.checklist.length})
            </h2>
            <strong>{percent}%</strong>
          </div>
          <div className="progress mt-5">
            <span className="bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-4">
            {task.checklist.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 border-b border-[#e8ecf3] py-3"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={isUpdatingTodo}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="accent-primary disabled:cursor-wait"
                />
                <span
                  className={item.completed ? "text-muted line-through" : ""}
                >
                  {item.title}
                </span>
              </label>
            ))}
            {!task.checklist.length && (
              <p className="text-sm text-muted">No checklist items.</p>
            )}
          </div>
          {task.attachments.length > 0 && (
            <>
              <h2 className="mt-7 text-xl font-bold">Attachments</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {task.attachments.map((a) => (
                  <a
                    className="secondary-btn"
                    key={a.id}
                    href={a.url}
                    download={a.name}
                  >
                    <Paperclip size={16} />
                    {a.name}
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
        <aside className="card p-5 sm:p-6">
          <h2 className="text-xl font-bold">Comments</h2>
          <div className="mt-4 flex gap-2">
            <input
              className="field"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
              placeholder="Add a comment..."
            />
            <button onClick={sendComment} className="primary-btn px-3">
              <MessageSquare size={17} />
            </button>
          </div>
          <div className="mt-5">
            {task.comments.map((c) => (
              <div key={c.id} className="border-b border-[#e9edf4] py-4">
                <p className="text-sm font-bold">{c.author}</p>
                <p className="mt-2 text-sm leading-5">{c.text}</p>
                <p className="mt-2 text-xs text-muted">
                  {dayjs(c.createdAt).format("MMM D, h:mm A")}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={removeTask}
        title="Delete task?"
        body="This task, checklist, comments, and local attachments will be removed."
      />
    </>
  );
}
