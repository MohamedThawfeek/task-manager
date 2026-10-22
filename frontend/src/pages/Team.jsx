import { Edit3, LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  Avatar,
  ConfirmModal,
  EmptyState,
  Modal,
  PageHeader,
} from "../components/common";
import { MemberForm } from "../components/forms";
import useTeam from "../hooks/team/useTeam";

export default function TeamPage() {
  const {
    team,
    error: teamError,
    isLoading: teamLoading,
    isMutating: teamMutating,
    modal,
    editing,
    deleting,
    setDeleting,
    loadTeam,
    openCreate,
    openEdit,
    closeModal,
    memberForm,
    showPassword,
    setShowPassword,
    removeMember,
    access,
  } = useTeam();
  return (
    <>
      <PageHeader
        title="Team Members"
        subtitle="Manage your team, access, and account status"
        action={
          access.includes("Admin") && (
            <button
              disabled={teamMutating}
              className="primary-btn disabled:opacity-60"
              onClick={openCreate}
            >
              <Plus size={17} />
              Add Member
            </button>
          )
        }
      />
      {teamError && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ffd6de] bg-[#fff2f5] px-4 py-3 text-sm text-[#c92f4f]">
          <span>{teamError}</span>
          <button
            onClick={() => loadTeam().catch(() => undefined)}
            className="flex items-center gap-2 font-semibold"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}
      <section className="card overflow-hidden p-4 sm:p-6">
        {teamLoading ? (
          <div className="grid min-h-[300px] place-items-center text-primary">
            <div className="text-center">
              <LoaderCircle className="mx-auto animate-spin" size={34} />
              <p className="mt-3 text-sm text-muted">Loading users…</p>
            </div>
          </div>
        ) : team.length ? (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Access</th>
                <th>Status</th>
                {access.includes("Admin") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {team.map((m) => {
                const status =
                  m.status === "Inactive" ||
                  String(m.status).toLowerCase() === "inactive"
                    ? "Inactive"
                    : "Active";
                return (
                  <tr key={m.id}>
                    <td data-label="Name">
                      <span className="flex items-center gap-3 font-semibold">
                        <Avatar member={m} size={30} />
                        {m.name}
                      </span>
                    </td>
                    <td data-label="Role" className="text-[#50607d]">
                      {m.role}
                    </td>
                    <td data-label="Email" className="text-[#50607d]">
                      {m.email}
                    </td>
                    <td data-label="Phone" className="text-[#50607d]">
                      {m.phone || "—"}
                    </td>
                    <td data-label="Access">
                      <span
                        className={`badge ${m.access === "Admin" ? "bg-[#eeecff] text-primary" : "bg-[#eef2f7] text-[#64728e]"}`}
                      >
                        {m.access || "User"}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`badge ${status === "Active" ? "badge-green" : "bg-[#eef0f5] text-muted"}`}
                      >
                        {status}
                      </span>
                    </td>
                    {access.includes("Admin") && (
                      <td data-label="Actions">
                        <div className="flex gap-2">
                          <button
                            disabled={teamMutating}
                            aria-label={`Edit ${m.name}`}
                            className="rounded-lg p-2 hover:bg-[#eef1f7] disabled:opacity-50"
                            onClick={() => openEdit(m)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            disabled={teamMutating}
                            aria-label={`Delete ${m.name}`}
                            className="rounded-lg p-2 text-[#ef476f] hover:bg-[#fff0f3] disabled:opacity-50"
                            onClick={() => setDeleting(m)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No users found"
            message="Add your first team member to get started."
            action={
              <button className="primary-btn" onClick={openCreate}>
                Add Member
              </button>
            }
          />
        )}
      </section>
      <Modal
        open={modal}
        onClose={closeModal}
        title={editing ? "Edit Team Member" : "Add Team Member"}
      >
        <MemberForm
          form={memberForm}
          editing={Boolean(editing)}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </Modal>
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={removeMember}
        title="Remove team member?"
        body={`${deleting?.name} will be permanently deleted.`}
      />
    </>
  );
}
