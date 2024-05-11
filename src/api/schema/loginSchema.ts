import {z} from 'zod';

export const loginUserSchema = z.object({
  email: z
    .string({
      required_error: `Email is required.`,
      invalid_type_error: 'Invalid Email.',
    })
    .email(),
  password: z
    .string({
      required_error: 'Password is required.',
    })
    .min(8, {message: 'Password must contain atleast 8 characters.'}),
});

export type TLoginUserSchema = z.infer<typeof loginUserSchema>;

export interface User {
  Id: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Dob: string | null;
  Gender: string;
  PhoneNumber: string;
  About: null;
  ProfileImg: string;
  RoleId: string;
  created_by: string;
  last_login: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  PatientId: string;
  RoleName: string;
  ClinicNames: string;
  ClinicIds: string;
  Clinics: Clinic[];
}

export interface Clinic {
  ClinicId: string;
  ClinicName: string;
}
