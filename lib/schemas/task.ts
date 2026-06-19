import z from "zod";

export const createTaskSchema = z.object({
    title: z.string().trim().min(1, { message: 'Task title is required' }).max(200, { message: 'Task title is too long' }),
    description: z.string().trim().max(5000, { message: 'Description is too long' }).optional(),
    section_id: z.string().trim().min(1, { message: 'Section ID is required' }),
    sort_order: z.number().min(0, { message: 'Sort order must be greater than or equal to 0' }),
    due_date: z.date().optional(),
    assignee_id: z.string().trim().optional(),
    priority: z.enum(['low', 'medium', 'high'], { message: 'Priority is required' }),
})

export const updateTaskSchema = z.object({
    title: z.string().trim().min(1, { message: 'Task title is required' }).max(200, { message: 'Task title is too long' }),
    description: z.string().trim().max(5000, { message: 'Description is too long' }).optional(),
    due_date: z.date().optional(),
    assignee_id: z.string().trim().optional(),
    priority: z.enum(['low', 'medium', 'high'], { message: 'Priority is required' }),
})

export const moveTaskSchema = z.object({
    taskId: z.string().trim().min(1, { message: 'Task ID is required' }),
    targetSectionId: z.string().trim().min(1, { message: 'Target section ID is required' }),
    targetSectionTaskIds: z.array(z.string().trim().min(1)).min(1, { message: 'At least one task ID is required' }),
    sourceSectionId: z.string().trim().min(1).optional(),
    sourceSectionTaskIds: z.array(z.string().trim().min(1)).optional(),
})