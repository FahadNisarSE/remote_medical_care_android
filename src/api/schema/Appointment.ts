export interface Appointment {
  AppointmentId: string;
  DoctorId: string;
  PatientId: string;
  ClinicId: string;
  AppointmentStatus: string;
  MeetingLink: string | null;
  MeetingChannel: string | null;
  CanceledBy: string | null;
  CancellationReason: string | null;
  AppointmentDate: string;
  AppointmentStartTime: string;
  AppointmentEndTime: string;
  RescheduledBy: string | null;
  created_at: string;
  updated_at: string;
  SpecialTreatment: string;
  Diagnosis?: string;
  Symptoms?: string;
  CloserDiagnosis: string | null;
  ClinicName: string;
  Firstname: string;
  Lastname: string;
  ProfileImg: string;
}

export interface AppointmentDetail {
  AppointmentId: string;
  DoctorId: string;
  PatientId: string;
  ClinicId: string;
  AppointmentStatus: string;
  MeetingLink: string | null;
  MeetingChannel: string | null;
  CanceledBy: string | null;
  CancellationReason: string | null;
  AppointmentDate: string;
  AppointmentStartTime: string;
  AppointmentEndTime: string;
  RescheduledBy: string | null;
  created_at: string;
  IsoEndTime: string;
  IsoStartTime: string;
  updated_at: string;
  Diagnosis?: string;
  Symptoms?: string;
  CloserDiagnosis: string | null;
  doctor: Doctor;
  patient: Patient;
  questions: AppointmentAnswer[];
  Tests: AppointmentTest[];
}

export interface Doctor {
  DoctorId: string;
  UserId: string;
  Lnar: string;
  AssociationName: string;
  SpecialTreatment: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  ProfileImg: string;
  Dob: string;
  Gender: string;
  ClinicName: string;
}

interface Patient {
  PatientId: string;
  UserId: string;
  LastTetanusBoosterDate: string | null;
  Firstname: string;
  Lastname: string;
  Email: string;
  ProfileImg: string;
  Dob: string;
  Gender: string;
  ClinicName: string;
}

export interface AppointmentAnswer {
  AppointmentAnswerId: string;
  AppointmentId: string;
  Question: string;
  QuestionImage: string | null;
  Answer: string;
  AnswerImage: string | null;
  created_at: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
}

export interface AppointmentTest {
  AppointmentId: string;
  AppointmentTestId: string;
  TestId: string;
  TestType: '0' | '1',
  TestName: string;
  AppId: string;
  Instructions: string;
  DeviceId: string;
  AppName: string;
  PlaystoreLink: string;
  AppstoreLink: string;
  DeviceName: string;
  Result: AppointmentTestResult[];
}

interface AppointmentTestResult {
  TestResultId: string;
  AppointmentTestId: string;
  TestDate: string;
  DoctorComments: string;
  Variables: AppointmentTestVariable[];
}

interface AppointmentTestVariable {
  TestResultVariableId: string;
  VariableName: string;
  VariableValue: string;
  TestResultId: string;
}
