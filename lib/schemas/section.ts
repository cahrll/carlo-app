import z from "zod";

export const createSectionSchema = z.object({
    title: z.string().trim().min(1, { message: 'Section title is required' }).max(100, { message: 'Section title is too long' }),
    board_id: z.string().trim().min(1, { message: 'Board ID is required' }),
    sort_order: z.number().min(0, { message: 'Sort order must be greater than 0' }),
    creator_id: z.string().trim().min(1, { message: 'Creator ID is required' }),
})

export const updateSectionSchema = z.object({
    title: z.string().trim().min(1, { message: 'Section title is required' }).max(100, { message: 'Section title is too long' }),
})