export const teamSeed = [
  { id: 'm1', name: 'Sarah Khan', role: 'Product Manager', email: 'sarah@company.com', phone: '+1 555 0123', access: 'Admin', status: 'Active', avatar: 'SK' },
  { id: 'm2', name: 'Ali Raza', role: 'Developer', email: 'ali@company.com', phone: '+1 555 0124', access: 'User', status: 'Active', avatar: 'AR' },
  { id: 'm3', name: 'Fatima Noor', role: 'UI/UX Designer', email: 'fatima@company.com', phone: '+1 555 0125', access: 'User', status: 'Active', avatar: 'FN' },
  { id: 'm4', name: 'Usman Khan', role: 'Backend Developer', email: 'usman@company.com', phone: '+1 555 0126', access: 'User', status: 'Active', avatar: 'UK' },
  { id: 'm5', name: 'Ayesha Malik', role: 'Marketing Manager', email: 'ayesha@company.com', phone: '+1 555 0127', access: 'User', status: 'Active', avatar: 'AM' },
  { id: 'm6', name: 'Ahmed Ali', role: 'QA Engineer', email: 'ahmed@company.com', phone: '+1 555 0128', access: 'User', status: 'Active', avatar: 'AA' },
]

export const projectsSeed = [
  { id: 'p1', name: 'Website Redesign', description: 'Redesign the company website with modern UI/UX and improve performance.', status: 'Active', progress: 75, color: '#5b4bff', dueDate: '2026-10-25', memberIds: ['m1', 'm2', 'm3'] },
  { id: 'p2', name: 'Mobile App', description: 'A reliable companion app for customers on the go.', status: 'Active', progress: 60, color: '#2d86f5', dueDate: '2026-10-28', memberIds: ['m1', 'm2', 'm4', 'm6'] },
  { id: 'p3', name: 'Marketing Campaign', description: 'Launch campaign for our newest product collection.', status: 'Active', progress: 40, color: '#19b97a', dueDate: '2026-11-02', memberIds: ['m1', 'm3', 'm5'] },
  { id: 'p4', name: 'Product Launch', description: 'Coordinate launch deliverables across product and marketing.', status: 'Active', progress: 30, color: '#ff496c', dueDate: '2026-11-12', memberIds: ['m1', 'm2', 'm3', 'm5', 'm6'] },
  { id: 'p5', name: 'HR Portal', description: 'Build an employee self-service experience.', status: 'Active', progress: 50, color: '#f6a91b', dueDate: '2026-11-18', memberIds: ['m1', 'm2', 'm4'] },
  { id: 'p6', name: 'Internal Tools', description: 'Improve operational workflows for internal teams.', status: 'Active', progress: 25, color: '#8061ff', dueDate: '2026-12-01', memberIds: ['m1', 'm4'] },
]

const titles = ['Design homepage UI', 'Develop authentication', 'Set up database', 'API integration', 'Testing and bug fixes', 'Write product copy', 'Responsive QA', 'Release checklist']
const statuses = ['To Do', 'In Progress', 'Review', 'Done']
const assignees = ['m1', 'm2', 'm4', 'm3', 'm5', 'm6']

export const tasksSeed = Array.from({ length: 24 }, (_, index) => ({
  id: `t${index + 1}`,
  title: titles[index % titles.length],
  description: index % 3 === 0 ? 'Create a modern and responsive experience with clear hierarchy, polished interactions, and production-ready details.' : 'Collaborate with the team to complete this work and document the outcome.',
  projectId: `p${(index % 6) + 1}`,
  assigneeIds: index % 3 === 0
    ? [assignees[index % assignees.length], assignees[(index + 1) % assignees.length]]
    : [assignees[index % assignees.length]],
  priority: index % 4 === 0 ? 'High' : index % 4 === 1 ? 'Medium' : 'Low',
  status: statuses[index % statuses.length],
  dueDate: `2026-10-${String(4 + (index % 25)).padStart(2, '0')}`,
  checklist: index === 0 ? [
    { id: 'c1', title: 'Create wireframes', completed: true },
    { id: 'c2', title: 'Design hero section', completed: true },
    { id: 'c3', title: 'Design features section', completed: true },
    { id: 'c4', title: 'Design testimonials', completed: false },
    { id: 'c5', title: 'Prepare final design', completed: false },
  ] : [{ id: `c-${index}`, title: 'Review requirements', completed: index % 2 === 0 }],
  attachments: [],
  comments: index === 0 ? [
    { id: 'cm1', author: 'Ali Raza', text: 'The wireframes look great! Can you share the Figma file?', createdAt: '2026-10-14T09:00:00Z' },
    { id: 'cm2', author: 'Sarah Khan', text: 'Sure, here is the updated design link.', createdAt: '2026-10-14T10:30:00Z' },
    { id: 'cm3', author: 'Fatima Noor', text: 'I’ll review and provide feedback.', createdAt: '2026-10-14T11:10:00Z' },
  ] : [],
  createdAt: '2026-10-01T09:00:00Z',
}))

export const profileSeed = {
  id: 'm1', name: 'Sarah Khan', email: 'sarah@company.com', jobTitle: 'Product Manager', phone: '+1 555 0123',
  department: 'Product', location: 'Chennai, India', memberSince: '2025-01-10', avatar: '👩🏻',
}
