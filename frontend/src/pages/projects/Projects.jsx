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
  } = useProjects();
  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Manage your projects and track progress"
        action={
          <button className="primary-btn" onClick={openCreate}>
            <Plus size={17} />
            Create Project
          </button>
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
                  <div>
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-xs text-muted">
                      {count} tasks · {p.memberIds.length} members
                    </p>
                  </div>
                  <span className="badge badge-green ml-auto">{p.status}</span>
                </div>
                <div className="progress mt-6">
                  <span
                    style={{ width: `${p.progress}%`, background: p.color }}
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex -space-x-2">
                    {p.memberIds.map((id) => (
                      <Avatar
                        className="border-2 border-white"
                        key={id}
                        size={25}
                        member={team.find((m) => m.id === id)}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted">{p.progress}%</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted">
                    ▤ {dayjs(p.dueDate).format("MMM D, YYYY")}
                  </p>
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
        <ProjectForm form={projectForm} editing={Boolean(editing)} team={team} />
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
