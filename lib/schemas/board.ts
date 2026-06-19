import z from "zod";

export const createBoardSchema = z.object({
    title: z.string().trim().min(1, { message: 'Board title is required' }).max(200, { message: 'Board title is too long' }),
    org_id: z.string().trim().min(1, { message: 'Organization ID is required' }),
    description: z.string().trim().max(5000, { message: 'Description is too long' }).optional(),
})

export const updateBoardSchema = z.object({
    title: z.string().trim().min(1, { message: 'Board title is required' }).max(200, { message: 'Board title is too long' }),
    description: z.string().trim().max(5000, { message: 'Description is too long' }).optional(),
})