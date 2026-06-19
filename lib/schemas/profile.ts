import z from "zod";

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name is required' }).max(80, { message: 'Name is too long' }),
})
