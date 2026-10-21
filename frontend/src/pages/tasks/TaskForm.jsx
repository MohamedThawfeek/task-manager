import {
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../../components/common";
import { TaskForm } from "../../components/forms";
import useTaskForm from "../../hooks/task/useTaskForm";

export default function TaskFormPage() {
  const {
    id,
    initialTask,
    projects,
    team,
    form,
    checklist,
    checkText,
    setCheckText,
    addChecklistItem,
    removeChecklistItem,
    attachments,
    uploadAttachments,
    removeAttachment,
    isLoading,
    error,
  } = useTaskForm();
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
          form={form}
          projects={projects}
          team={team}
          checklist={checklist}
          checkText={checkText}
          setCheckText={setCheckText}
          addChecklistItem={addChecklistItem}
          removeChecklistItem={removeChecklistItem}
          attachments={attachments}
          uploadAttachments={uploadAttachments}
          removeAttachment={removeAttachment}
          submitLabel={initialTask ? "Save Changes" : "Create Task"}
        />
      </section>
    </>
  );
}
