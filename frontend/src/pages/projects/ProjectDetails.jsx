import dayjs from "dayjs";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  Avatar,
  ConfirmModal,
  EmptyState,
  LoadingScreen,
  Modal,
  PageHeader,
  priorityBadge,
  statusBadge,
} from "../../components/common";
import { ProjectForm } from "../../components/forms";
import Dropdown from "../../components/Dropdown";
import useProjectDetails from "../../hooks/project/useProjectDetails";
import { getTaskAssignees } from "../../utils/tasks";

export default function ProjectDetailsPage() {
  const {
    id,
    navigate,
    project,
    team,
    projectTasks,
    tab,
    setTab,
    edit,
    setEdit,
    confirm,
    setConfirm,
    memberId,
    setMemberId,
    projectForm,
    assignMember,
    removeMember,
    removeProject,
    loadProject,
    error,
    isLoading,
  } = useProjectDetails();
  if (isLoading && !project)
    return (
      <div className="card">
        <LoadingScreen />
      </div>
    );
  if (error && !project)
    return (
      <div className="card">
        <EmptyState
          title="Unable to load project"
          message={error}
          action={
            <button
              className="primary-btn"
              onClick={() => loadProject().catch(() => undefined)}
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  if (!project)
    return (
      <div className="card">
        <EmptyState
          title="Project not found"
          message="It may have been removed."
          action={
            <button
              className="primary-btn"
              onClick={() => navigate("/projects")}
            >
              Back to Projects
            </button>
          }
        />
      </div>
    );
  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.description}
        action={
          <div className="flex gap-2">
            <button
              className="secondary-btn text-[#ef476f]"
              onClick={() => setConfirm(true)}
            >
              <Trash2 size={16} />
            </button>
            <button className="primary-btn" onClick={() => setEdit(true)}>
              Edit Project
            </button>
          </div>
        }
      />
      <div className="mb-5 flex gap-3 overflow-x-auto">
        {["Overview", "Tasks", "Team", "Files"].map((x) => (
          <button
            className={`tab ${tab === x ? "active" : ""}`}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <section className="card p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Project Progress</h2>
          <span className="text-xl font-bold text-primary">
            {project.progress}%
          </span>
        </div>
        <div className="progress mt-6">
          <span
            className="bg-primary"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-muted">
          <span>
            Start Date:{" "}
            {project.createdAt
              ? dayjs(project.createdAt).format("MMM D, YYYY")
              : "—"}
          </span>
          <span>Due Date: {dayjs(project.dueDate).format("MMM D, YYYY")}</span>
          <span>Status: {project.status}</span>
        </div>
      </section>
      <section className="card mt-5 overflow-hidden p-5 sm:p-6">
        {tab === "Tasks" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Tasks ({projectTasks.length})
              </h2>
              <button
                className="primary-btn"
                onClick={() => navigate(`/tasks/new?project=${id}`)}
              >
                <Plus size={16} />
                Task
              </button>
            </div>
            {projectTasks.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Assignees</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {projectTasks.map((task, i) => {
                      const assignees = getTaskAssignees(task, team);
                      return (
                        <tr key={task.id}>
                          <td data-label="#">{i + 1}</td>
                          <td data-label="Title" className="font-semibold">
                            <button
                              onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                              {task.title}
                            </button>
                          </td>
                          <td data-label="Assignees">
                            <span className="flex items-center gap-2">
                              <span className="flex -space-x-2">
                                {assignees.slice(0, 3).map((assignee) => (
                                  <Avatar
                                    key={assignee.id}
                                    size={24}
                                    member={assignee}
                                    className="border-2 border-white"
                                  />
                                ))}
                              </span>
                              <span className="max-w-[180px] truncate">
                                {assignees
                                  .map((assignee) => assignee.name)
                                  .join(", ") || "Unassigned"}
                              </span>
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={statusBadge(task.status)}>
                              {task.status}
                            </span>
                          </td>
                          <td data-label="Priority">
                            <span className={priorityBadge(task.priority)}>
                              {task.priority}
                            </span>
                          </td>
                          <td data-label="Due Date">
                            {dayjs(task.dueDate).format("MMM D, YYYY")}
                          </td>
                          <td>
                            <MoreHorizontal size={16} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No tasks in this project" />
            )}
          </>
        )}
        {tab === "Overview" && (
          <div>
            <h2 className="text-xl font-bold">About this project</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted">
              {project.description}
            </p>
          </div>
        )}
        {tab === "Team" && (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-bold">Project team</h2>
              <div className="flex w-full gap-2 sm:w-auto">
                <Dropdown
                  className="min-w-0 flex-1 sm:w-55"
                  value={memberId}
                  onChange={setMemberId}
                  placeholder="Select a member"
                  options={team
                    .filter((member) => !project.memberIds.includes(member.id))
                    .map((member) => ({
                      label: member.name,
                      value: member.id,
                    }))}
                />
                <button className="primary-btn" onClick={assignMember}>
                  Assign
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.memberIds.map((mid) => {
                const m = team.find((x) => x.id === mid);
                return (
                  <div
                    key={mid}
                    className="flex items-center gap-3 rounded-xl border border-[#e5e9f1] p-4"
                  >
                    <Avatar member={m} />
                    <div>
                      <p className="font-bold">{m?.name}</p>
                      <p className="text-sm text-muted">{m?.role}</p>
                    </div>
                    <button
                      className="ml-auto rounded-lg p-2 text-[#ef476f] hover:bg-[#fff0f3]"
                      title="Remove from project"
                      onClick={() => removeMember(mid)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "Files" && (
          <div className="mt-5">{console.log("project", project)}</div>
        )}
        {["Files"].includes(tab) && (
          <EmptyState
            title={`No ${tab.toLowerCase()} yet`}
            message={`Project ${tab.toLowerCase()} will appear here.`}
          />
        )}
      </section>
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit Project">
        <ProjectForm form={projectForm} editing team={team} />
      </Modal>
      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={removeProject}
        title="Delete project?"
        body="The project and all of its tasks will be permanently removed."
      />
    </>
  );
}
