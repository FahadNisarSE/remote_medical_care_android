export type GuestDetails = {
  guest_id: string;
  guest_name: string;
  guest_email: string;
  password: string;
  appointment_id: string;
  invited_by: InvitedBy;
  created_at: CreatedAt;
};

type InvitedBy = {
  Id: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Dob: null; // Assuming null for now, can be adjusted if actual data type is provided
  Gender: string;
  PhoneNumber: string;
  About: null; // Assuming null for now, can be adjusted if actual data type is provided
  ProfileImg: string;
  RoleId: string;
  created_by: null; // Assuming null for now, can be adjusted if actual data type is provided
  last_login: string;
  Language: null; // Assuming null for now, can be adjusted if actual data type is provided
  is_profile_updated: string;
  updated_at: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  deleted_at: null;
};

type CreatedAt = {
  date: string;
  timezone_type: number;
  timezone: string;
};
