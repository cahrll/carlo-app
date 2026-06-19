import z from "zod";

export const createOrganizationSchema = z.object({
    name: z.string().trim().min(1, { message: 'Organization name is required' }).max(100, { message: 'Organization name is too long' }),
})

export const updateOrganizationSchema = z.object({
    name: z.string().trim().min(1, { message: 'Organization name is required' }).max(100, { message: 'Organization name is too long' }),
})