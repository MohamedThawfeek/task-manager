import dayjs from "dayjs";
import { Edit3, Plus, Trash2 } from "lucide-react";
import {
  Avatar,
  ConfirmModal,
  EmptyState,
  LoadingScreen,
  Modal,
  PageHeader,
} from "../../components/common";
import { ProjectForm } from "../../components/forms";
import useProjects from "../../hooks/project/useProjects";

export default function ProjectsPage() {
  const {
    tasks,
    team,
    list,
    filter,
    setFilter,
    modal,
    editing,
    deleting,
    setDeleting,
    navigate,
    openCreate,
    openEdit,
    closeModal,
    projectForm,
    confirmDelete,
    loadProjects,
    error,
    isLoading,
    access,
  } = useProjects();
  console.log("access", access);

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Manage your projects and track progress"
        action={
          access.includes("Admin") ? (
            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Create Project
            </button>
          ) : null
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {["All Projects", "Active", "Completed", "Inactive", "Hold"].map(
          (x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              className={`tab ${filter === x ? "active" : ""}`}
            >
              {x}
            </button>
          ),
        )}
      </div>
      {error && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ffd2dc] bg-[#fff3f6] px-4 py-3 text-sm text-[#c52e50]">
          <span>{error}</span>
          <button
            className="font-bold underline"
            onClick={() => loadProjects().catch(() => undefined)}
          >
            Retry
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="card">
          <LoadingScreen />
        </div>
      ) : list.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const count =
              p.taskCount ?? tasks.filter((t) => t.projectId === p.id).length;
            return (
              <article
                key={p.id}
                className="card cursor-pointer p-5 transition hover:-translate-y-1 hover:shadow-lg"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={{ background: p.color }}
                  >
                    ▣
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold">{p.name}</h3>
                    <p className="text-xs text-muted">
                      {count} tasks · {p.memberIds.length} members
                    </p>
                  </div>
                  <span className="badge badge-green shrink-0">{p.status}</span>
                </div>
                <div className="progress mt-6">
                  <span
                    style={{ width: `${p.progress}%`, background: p.color }}
                  />
                </div>
                <div className="mt-4 flex min-h-[29px] items-center justify-between gap-3">
                  <div className="flex min-w-0 -space-x-2">
                    {p.memberIds.slice(0, 4).map((id) => (
                      <Avatar
                        className="border-2 border-white"
                        key={id}
                        size={25}
                        member={
                          team.find((member) => member.id === id) ||
                          p.members.find((member) => member.id === id)
                        }
                      />
                    ))}
                    {p.memberIds.length > 4 && (
                      <span className="avatar h-[25px] w-[25px] border-2 border-white text-[9px]">
                        +{p.memberIds.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-muted">
                    {p.progress}%
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted">
                    {p.dueDate
                      ? `▤ ${dayjs(p.dueDate).format("MMM D, YYYY")}`
                      : "No due date"}
                  </p>
                  {access.includes("Admin") && (
                    <div className="flex gap-1">
                      <button
                        className="rounded p-1.5 hover:bg-[#eef0f7]"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="rounded p-1.5 text-[#ef476f] hover:bg-[#fff0f3]"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(p);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            title="No projects found"
            message="Try another filter or create a project."
            action={
              <button className="primary-btn" onClick={openCreate}>
                Create Project
              </button>
            }
          />
        </div>
      )}
      <Modal
        open={modal}
        onClose={closeModal}
        title={editing ? "Edit Project" : "Create Project"}
      >
        <ProjectForm
          form={projectForm}
          editing={Boolean(editing)}
          team={team}
        />
      </Modal>
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete project?"
        body={`This will also remove every task in ${deleting?.name}.`}
      />
    </>
  );
}
