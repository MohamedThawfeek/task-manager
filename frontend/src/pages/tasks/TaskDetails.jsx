import dayjs from "dayjs";
import {
  CalendarDays,
  Columns3,
  Edit3,
  FileText,
  MessageSquare,
  Paperclip,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  ConfirmModal,
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../../components/common";
import useTaskDetails from "../../hooks/task/useTaskDetails";

export default function TaskDetailsPage() {
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
    isLoadingComments,
    isSendingComment,
    error,
    access,
  } = useTaskDetails();
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
          access.includes("Admin") && (
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
          )
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendComment();
                }
              }}
              placeholder="Add a comment..."
              disabled={isSendingComment}
            />
            <button
              onClick={sendComment}
              className="primary-btn px-3"
              disabled={isSendingComment || !comment.trim()}
              aria-label="Add comment"
            >
              <MessageSquare size={17} />
            </button>
          </div>
          <div className="mt-5">
            {isLoadingComments && (
              <p className="py-4 text-sm text-muted">Loading comments…</p>
            )}
            {task.comments.map((c) => (
              <div key={c.id} className="border-b border-[#e9edf4] py-4">
                <p className="text-sm font-bold">{c.author}</p>
                <p className="mt-2 text-sm leading-5">{c.text}</p>
                <p className="mt-2 text-xs text-muted">
                  {dayjs(c.createdAt).format("MMM D, h:mm A")}
                </p>
              </div>
            ))}
            {!isLoadingComments && !task.comments.length && (
              <p className="py-4 text-sm text-muted">No comments yet.</p>
            )}
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
