import z from 'zod';

export default z.object({
    id: z.number({
        description: 'The id of the user'
    }),
    name: z.string({
        description: 'The name of the user'
    }),
    admin: z.boolean({
        description: 'Whether the user is an admin or not'
    })
});
