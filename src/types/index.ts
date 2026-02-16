// User types
export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  activity_type: string;
  avatar_url?: string | null;
  sound_enabled: boolean;
  is_active: boolean;
  created_at: string;
  company_id?: number | null;
  company_name?: string | null;
  company_inn?: string | null;
  role?: string | null;
}

export interface UserResponse {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  activity_type: string;
  avatar_url?: string | null;
  sound_enabled: boolean;
  is_active: boolean;
  created_at: string;
  company_id?: number | null;
  company_name?: string | null;
  company_inn?: string | null;
  role?: string | null;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  login: string;
  password: string;
  code: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  activity_type: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  needs_company_setup: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  is_admin: boolean;
}

export interface CompanySetupCreate {
  name: string;
  inn: string;
}

export interface CompanySetupJoin {
  inn: string;
}

export interface CompanyLookupResponse {
  found: boolean;
  company_name?: string | null;
  company_id?: number | null;
}

// Company types
export interface CompanyAdminView {
  id: number;
  name: string;
  inn: string;
  activity_type: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  members_count: number;
  director_name?: string | null;
  director_phone?: string | null;
}

// Declaration types
export interface DeclarationVehicle {
  vehicle_type: string;
  vehicle_number: string;
}

export interface DeclarationCreate {
  post_number: string;
  send_date: string;
  declaration_number: string;
  client_id: number;
  regime: string;
  vehicles: DeclarationVehicle[];
  note?: string | null;
  attachment_document_ids?: number[];
  attachment_folder_ids?: number[];
}

export interface DeclarationResponse {
  id: number;
  post_number: string;
  send_date: string;
  declaration_number: string;
  display_number: string;
  client_id: number;
  client_name?: string | null;
  regime: string;
  note?: string | null;
  company_id: number;
  user_id: number;
  user_name?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  vehicles: DeclarationVehicleResponse[];
  attachments: DeclarationAttachmentResponse[];
  created_at: string;
  updated_at: string;
  certificates_count?: number;
  tasks_count?: number;
}

export interface DeclarationShort {
  id: number;
  display_number: string;
  client_name?: string | null;
  regime: string;
  user_name?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  created_at: string;
}

// Certificate types
export interface CertificateCreate {
  certifier_company_id?: number | null;
  is_self?: boolean;
  certificate_type: string;
  deadline: string;
  certificate_number?: string | null;
  is_number_by_certifier?: boolean;
  client_id: number;
  declaration_ids?: number[];
  note?: string | null;
  attachment_document_ids?: number[];
  attachment_folder_ids?: number[];
}

export interface CertificateResponse {
  id: number;
  certifier_company_id?: number | null;
  certifier_company_name?: string | null;
  is_self: boolean;
  certificate_type: string;
  deadline: string;
  certificate_number?: string | null;
  is_number_by_certifier: boolean;
  client_id: number;
  client_name?: string | null;
  status: string;
  rejection_note?: string | null;
  send_date: string;
  declarant_company_id: number;
  declarant_company_name?: string | null;
  declarant_user_id: number;
  declarant_user_name?: string | null;
  assigned_user_id?: number | null;
  assigned_user_name?: string | null;
  files: CertificateFileResponse[];
  attachments: CertificateAttachmentResponse[];
  declarations: CertificateDeclarationResponse[];
  actions: CertificateActionResponse[];
  created_at: string;
  updated_at: string;
}

// Task types
export interface TaskCreate {
  target_company_id: number;
  target_user_id: number;
  title: string;
  note?: string | null;
  priority: string;
  status: string;
  deadline: string;
  attachment_document_ids?: number[];
  attachment_folder_ids?: number[];
  attachment_declaration_ids?: number[];
  attachment_certificate_ids?: number[];
}

// Client types
export interface ClientCreate {
  company_name: string;
  inn?: string | null;
  director_name?: string | null;
  access_type: string;
  note?: string | null;
  granted_user_ids?: number[];
}

// Notification types
export interface NotificationResponse {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message?: string | null;
  is_read: boolean;
  data?: any | null;
  created_at: string;
}

// Dashboard types
export interface DashboardDeclarant {
  active_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  sent_declarations: number;
  in_progress_certificates: number;
  completed_certificates: number;
  overdue_certificates: number;
  recent_declarations: DeclarationShortDash[];
  recent_certificates: CertificateShortDash[];
  date_from?: string | null;
  date_to?: string | null;
  selected_user_id?: number | null;
  selected_user_name?: string | null;
}