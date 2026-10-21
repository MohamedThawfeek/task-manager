import { Eye, EyeOff } from "lucide-react";
import Dropdown from "../Dropdown";

function FieldError({ form, name }) {
  if (!form.touched[name] || !form.errors[name]) return null;
  return <p className="error-text">{form.errors[name]}</p>;
}

export default function MemberForm({
  form,
  editing,
  showPassword,
  setShowPassword,
}) {
  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            className={`field ${form.touched.name && form.errors.name ? "field-error" : ""}`}
            placeholder="Full name"
          />
          <FieldError form={form} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            className={`field ${form.touched.email && form.errors.email ? "field-error" : ""}`}
            placeholder="Email address"
          />
          <FieldError form={form} name="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.values.password}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              autoComplete="new-password"
              className={`field pr-11 ${form.touched.password && form.errors.password ? "field-error" : ""}`}
              placeholder={editing ? "Leave blank to keep current" : "Minimum 6 characters"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError form={form} name="password" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.values.phone}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            className={`field ${form.touched.phone && form.errors.phone ? "field-error" : ""}`}
            placeholder="Phone number"
          />
          <FieldError form={form} name="phone" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="role">Role</label>
        <input
          id="role"
          name="role"
          value={form.values.role}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          className={`field ${form.touched.role && form.errors.role ? "field-error" : ""}`}
          placeholder="Role"
        />
        <FieldError form={form} name="role" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Access</label>
          <Dropdown
            value={form.values.access}
            onChange={(value) => form.setFieldValue("access", value)}
            options={["User", "Admin"]}
            error={Boolean(form.touched.access && form.errors.access)}
          />
          <FieldError form={form} name="access" />
        </div>
        <div>
          <label className="label">Status</label>
          <Dropdown
            value={form.values.status}
            onChange={(value) => form.setFieldValue("status", value)}
            options={["Active", "Inactive"]}
            error={Boolean(form.touched.status && form.errors.status)}
          />
          <FieldError form={form} name="status" />
        </div>
      </div>
      <button
        disabled={form.isSubmitting}
        className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {form.isSubmitting ? "Please wait…" : editing ? "Save Member" : "Create Member"}
      </button>
    </form>
  );
}
