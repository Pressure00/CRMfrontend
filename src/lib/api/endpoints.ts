import { apiClient } from "./client";

// Auth endpoints
export const authApi = {
  register: (data: any) => apiClient.post("/api/auth/register", data),
  login: (data: any) => apiClient.post("/api/auth/login", data),
  adminLogin: (data: any) => apiClient.post("/api/auth/admin/login", data),
  companyLookup: (data: any) => apiClient.post("/api/auth/company/lookup", data),
  companyCreate: (data: any) => apiClient.post("/api/auth/company/create", data),
  companyJoin: (data: any) => apiClient.post("/api/auth/company/join", data),
  getMe: () => apiClient.get("/api/auth/me"),
  getCompanyStatus: () => apiClient.get("/api/auth/me/company-status"),
  forgotPassword: (data: any) => apiClient.post("/api/auth/forgot-password", data),
};

// Admin endpoints
export const adminApi = {
  getDashboard: () => apiClient.get("/api/admin/dashboard"),
  listCompanies: (params?: any) => apiClient.get("/api/admin/companies", { params }),
  getCompany: (id: number) => apiClient.get(`/api/admin/companies/${id}`),
  deleteCompany: (id: number) => apiClient.delete(`/api/admin/companies/${id}`),
  blockCompany: (id: number) => apiClient.post(`/api/admin/companies/${id}/block`),
  unblockCompany: (id: number) => apiClient.post(`/api/admin/companies/${id}/unblock`),
  sendMessageToCompany: (id: number, data: any) => 
    apiClient.post(`/api/admin/companies/${id}/message`, data),
  listUsers: (params?: any) => apiClient.get("/api/admin/users", { params }),
  getUser: (id: number) => apiClient.get(`/api/admin/users/${id}`),
  deleteUser: (id: number) => apiClient.delete(`/api/admin/users/${id}`),
  blockUser: (id: number) => apiClient.post(`/api/admin/users/${id}/block`),
  unblockUser: (id: number) => apiClient.post(`/api/admin/users/${id}/unblock`),
  assignRole: (id: number, data: any) => 
    apiClient.post(`/api/admin/users/${id}/assign-role`, data),
  listRequests: (params?: any) => apiClient.get("/api/admin/requests", { params }),
  handleRequest: (id: number, data: any) => 
    apiClient.post(`/api/admin/requests/${id}/action`, data),
};

// Dashboard endpoints
export const dashboardApi = {
  getDeclarantDashboard: (params?: any) => 
    apiClient.get("/api/dashboard/declarant", { params }),
  getCertifierDashboard: (params?: any) => 
    apiClient.get("/api/dashboard/certifier", { params }),
};

// Declarations endpoints
export const declarationsApi = {
  create: (data: any) => apiClient.post("/api/declarations/", data),
  list: (params?: any) => apiClient.get("/api/declarations/", { params }),
  get: (id: number) => apiClient.get(`/api/declarations/${id}`),
  update: (id: number, data: any) => apiClient.put(`/api/declarations/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/declarations/${id}`),
  redirect: (id: number, data: any) => 
    apiClient.post(`/api/declarations/${id}/redirect`, data),
  createGroup: (data: any) => apiClient.post("/api/declarations/groups", data),
  addToGroup: (id: number, data: any) => 
    apiClient.post(`/api/declarations/${id}/add-to-group`, data),
  removeFromGroup: (id: number) => 
    apiClient.post(`/api/declarations/${id}/remove-from-group`),
  listGroups: () => apiClient.get("/api/declarations/groups/list"),
  deleteGroup: (id: number) => apiClient.delete(`/api/declarations/groups/${id}`),
};

// Certificates endpoints
export const certificatesApi = {
  create: (data: any) => apiClient.post("/api/certificates/", data),
  list: (params?: any) => apiClient.get("/api/certificates/", { params }),
  get: (id: number) => apiClient.get(`/api/certificates/${id}`),
  update: (id: number, data: any) => apiClient.put(`/api/certificates/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/certificates/${id}`),
  updateStatus: (id: number, data: any) => 
    apiClient.post(`/api/certificates/${id}/status`, data),
  fillNumber: (id: number, data: any) => 
    apiClient.post(`/api/certificates/${id}/fill-number`, data),
  assign: (id: number, data: any) => 
    apiClient.post(`/api/certificates/${id}/assign`, data),
  redirect: (id: number, data: any) => 
    apiClient.post(`/api/certificates/${id}/redirect`, data),
  confirmReview: (id: number) => 
    apiClient.post(`/api/certificates/${id}/confirm-review`),
  confirmPayment: (id: number) => 
    apiClient.post(`/api/certificates/${id}/confirm-payment`),
  uploadFile: (id: number, fileType: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/api/certificates/${id}/upload-file?file_type=${fileType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Tasks endpoints
export const tasksApi = {
  create: (data: any) => apiClient.post("/api/tasks/", data),
  list: (params?: any) => apiClient.get("/api/tasks/", { params }),
  get: (id: number) => apiClient.get(`/api/tasks/${id}`),
  update: (id: number, data: any) => apiClient.put(`/api/tasks/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/tasks/${id}`),
};

// Documents endpoints
export const documentsApi = {
  createFolder: (data: any) => apiClient.post("/api/documents/folders", data),
  listFolders: (params?: any) => apiClient.get("/api/documents/folders", { params }),
  getFolder: (id: number) => apiClient.get(`/api/documents/folders/${id}`),
  updateFolder: (id: number, data: any) => 
    apiClient.put(`/api/documents/folders/${id}`, data),
  deleteFolder: (id: number) => apiClient.delete(`/api/documents/folders/${id}`),
  attachFolderToClient: (id: number, data: any) => 
    apiClient.post(`/api/documents/folders/${id}/attach-client`, data),
  uploadDocument: (file: File, folderId?: number, clientId?: number) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folder_id", folderId.toString());
    if (clientId) formData.append("client_id", clientId.toString());
    return apiClient.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadMultiple: (files: File[], folderId?: number, clientId?: number) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (folderId) formData.append("folder_id", folderId.toString());
    if (clientId) formData.append("client_id", clientId.toString());
    return apiClient.post("/api/documents/upload-multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  listDocuments: (params?: any) => apiClient.get("/api/documents/files", { params }),
  getDocument: (id: number) => apiClient.get(`/api/documents/files/${id}`),
  deleteDocument: (id: number) => apiClient.delete(`/api/documents/files/${id}`),
  moveDocument: (id: number, data: any) => 
    apiClient.post(`/api/documents/files/${id}/move`, data),
  attachDocumentToClient: (id: number, data: any) => 
    apiClient.post(`/api/documents/files/${id}/attach-client`, data),
};

// Clients endpoints
export const clientsApi = {
  create: (data: any) => apiClient.post("/api/clients", data),
  list: (params?: any) => apiClient.get("/api/clients", { params }),
  get: (id: number) => apiClient.get(`/api/clients/${id}`),
  update: (id: number, data: any) => apiClient.put(`/api/clients/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/clients/${id}`),
  getActivity: (id: number) => apiClient.get(`/api/clients/${id}/activity`),
};

// Partnerships endpoints
export const partnershipsApi = {
  lookup: (data: any) => apiClient.post("/api/partnerships/lookup", data),
  sendRequest: (data: any) => apiClient.post("/api/partnerships/request", data),
  list: () => apiClient.get("/api/partnerships/"),
  listPending: () => apiClient.get("/api/partnerships/pending"),
  delete: (id: number) => apiClient.delete(`/api/partnerships/${id}`),
};

// Employees endpoints
export const employeesApi = {
  list: () => apiClient.get("/api/employees"),
  block: (id: number) => apiClient.post(`/api/employees/${id}/block`),
  unblock: (id: number) => apiClient.post(`/api/employees/${id}/unblock`),
  remove: (id: number, data: any) => apiClient.delete(`/api/employees/${id}`, { data }),
};

// Notifications endpoints
export const notificationsApi = {
  get: (params?: any) => apiClient.get("/api/notifications", { params }),
  clearAll: () => apiClient.delete("/api/notifications"),
  getUnreadCount: () => apiClient.get("/api/notifications/unread-count"),
  markRead: (data: any) => apiClient.post("/api/notifications/mark-read", data),
  markSingleRead: (id: number) => apiClient.post(`/api/notifications/${id}/read`),
  delete: (id: number) => apiClient.delete(`/api/notifications/${id}`),
  toggleSound: (data: any) => apiClient.post("/api/notifications/sound", data),
  getSoundStatus: () => apiClient.get("/api/notifications/sound-status"),
};

// Settings endpoints
export const settingsApi = {
  getProfile: () => apiClient.get("/api/settings/profile"),
  updateProfile: (data: any) => apiClient.put("/api/settings/profile", data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/api/settings/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteAvatar: () => apiClient.delete("/api/settings/avatar"),
  requestPasswordChange: (data: any) => 
    apiClient.post("/api/settings/change-password/request", data),
  confirmPasswordChange: (code: string) => 
    apiClient.post(`/api/settings/change-password/confirm?code=${code}`),
  requestEmailChange: (data: any) => 
    apiClient.post("/api/settings/change-email/request", data),
  confirmEmailChange: (code: string) => 
    apiClient.post(`/api/settings/change-email/confirm?code=${code}`),
  linkTelegram: (chatId: string) => 
    apiClient.post(`/api/settings/link-telegram?telegram_chat_id=${chatId}`),
};