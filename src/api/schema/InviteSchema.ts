import * as z from 'zod';

export const InviteSchema = z.object({
  email: z
    .string({
      required_error: `Email is required.`,
      invalid_type_error: 'Invalid Email.',
    })
    .email(),
  username: z
    .string({
      required_error: 'Username is required.',
    })
    .min(2, {message: 'Username is required.'}),
});
