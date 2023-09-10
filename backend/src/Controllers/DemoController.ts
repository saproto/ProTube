// import { User } from '@app/Models/User';
// import UserSchema from '@app/Schemas/UserSchema';
// import { route } from '@Kernel/RouteRegistrar';
// import url from '@Services/RoutingService';
// import z from 'zod';

// export const firstRoute = route({
//     schema: UserSchema,
//     handler: async (request, reply) => {
//         const users = await User.findAll();
//         reply.send(users);
//     }
// });

// export const createUser = route({
//     schema: z.object({}),
//     handler: async (request, reply) => {
//         // await User.create({
//         //     name: 'test',
//         //     admin: true
//         // });

//         reply.send({});
//     }
// });

// export const demoPost = route({
//     schema: z.object({
//         name: z.string()
//     }),
//     bodySchema: z.object({
//         test: z.number()
//     }),
//     handler: async (request, reply) => {
//         const body = request.body;
//         reply.send({
//             // name: url('http.create.test')
//             name: url('http.create.test')
//         });
//     }
// });
