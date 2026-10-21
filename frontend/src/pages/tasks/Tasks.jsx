import dayjs from "dayjs";
import { Columns3, Plus } from "lucide-react";
import { Avatar, LoadingScreen, PageHeader } from "../../components/common";
import Dropdown from "../../components/Dropdown";
import SearchInput from "../../components/SearchInput";
import useTasks from "../../hooks/task/useTasks";

const columns = [
  { name: "To Do", color: "#f0f3f9" },
  { name: "In Progress", color: "#eaf3ff" },
  { name: "Review", color: "#fff6e4" },
  { name: "Done", color: "#eaf8f2" },
];

export default function TasksPage() {
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
  } = useTasks();
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
              className="kanban-col min-h-135"
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
