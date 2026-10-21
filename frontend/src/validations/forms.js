import * as yup from 'yup'

export const taskSchema = yup.object({
  title: yup.string().min(3, 'Title must contain at least 3 characters').required('Title is required'),
  projectId: yup.string().required('Select a project'),
  assigneeIds: yup.array().of(yup.string().required()).min(1, 'Select at least one assignee').required('Select at least one assignee'),
  priority: yup.string().oneOf(['Low', 'Medium', 'High']).required(),
  status: yup.string().oneOf(['To Do', 'In Progress', 'Review', 'Done']).required(),
  dueDate: yup.string().required('Choose a due date'),
  description: yup.string().max(600).optional(),
})

export const projectSchema = yup.object({
  name: yup.string().min(3, 'Enter a project name').required('Project name is required'),
  description: yup.string().min(3, 'Add a short description').required('Description is required'),
  status: yup.string().oneOf(['Active', 'Completed', 'Inactive', 'Hold']).required(),
  progress: yup.number().typeError('Enter a valid progress').min(0).max(100).required('Progress is required'),
  memberIds: yup.array().of(yup.string().required()).min(1, 'Select at least one user').required('Select at least one user'),
  dueDate: yup.string().required('Choose a due date'),
})

export const memberSchema = (editing) => yup.object({
  name: yup.string().min(2, 'Enter a name').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: editing
    ? yup.string().test('password-length', 'Use at least 6 characters', (value) => !value || value.length >= 6)
    : yup.string().min(6, 'Use at least 6 characters').required('Password is required'),
  phone: yup.string().min(7, 'Enter a valid phone number').max(20, 'Phone number is too long').matches(/^[+0-9()\s-]+$/, 'Enter a valid phone number').required('Phone number is required'),
  role: yup.string().min(2, 'Enter a role').required('Role is required'),
  access: yup.string().oneOf(['User', 'Admin']).required(),
  status: yup.string().oneOf(['Active', 'Inactive']).required(),
})

export const profileSchema = yup.object({
  name: yup.string().min(2, 'Enter your full name').required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  jobTitle: yup.string().min(2, 'Enter your job title').required('Job title is required'),
  phone: yup.string().min(7, 'Enter a valid phone number').max(20, 'Phone number is too long').required('Phone number is required'),
})

export const passwordSchema = yup.object({
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords do not match').required('Confirm your new password'),
})
