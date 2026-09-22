const API_BASE_URL = "http://localhost:8000/api/v1";

import type {
  User,
  Profile,
  Experience,
  Education,
  Project,
  Certification,
  Document,
  Post,
  PostVersion,
  Platform,
  ProfileType,
  PlatformCategory,
} from "./types";

/**
 * FastAPI's error `detail` field isn't always a plain string:
 * - Most handwritten errors (401, 400, 404) send a string.
 * - Pydantic validation errors (422) send an ARRAY of objects like
 *   { type, loc, msg, ctx }.
 * Passing that array straight into `new Error(...)` silently stringifies
 * it to "[object Object]" (Array.toString() calls toString() on each
 * element, and plain objects have no useful toString()). This normalizes
 * either shape into one readable string.
 */
function extractErrorMessage(errorBody: unknown, fallback: string): string {
  if (!errorBody || typeof errorBody !== "object") return fallback;
  const detail = (errorBody as { detail?: unknown }).detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          const loc = Array.isArray((item as { loc?: unknown[] }).loc)
            ? (item as { loc: unknown[] }).loc
                .filter((p) => p !== "body")
                .join(".")
            : null;
          const msg = (item as { msg: string }).msg;
          return loc ? `${loc}: ${msg}` : msg;
        }
        return typeof item === "string" ? item : JSON.stringify(item);
      })
      .join("; ");
  }

  return fallback;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        extractErrorMessage(errorBody, `HTTP error ${response.status}`),
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async register(email: string, password: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
  }

  async getCurrentUser() {
    return this.request<User>("/users/me");
  }

  async getProfiles() {
    return this.request<Profile[]>("/profiles");
  }

  async createProfile(profile: Partial<Profile>) {
    return this.request<Profile>("/profiles", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  }

  async getProfile(type: ProfileType) {
    return this.request<Profile>(`/profiles/${type}`);
  }

  async updateProfile(type: ProfileType, profile: Partial<Profile>) {
    return this.request<Profile>(`/profiles/${type}`, {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  }

  async getExperiences() {
    return this.request<Experience[]>("/experiences");
  }

  async createExperience(
    experience: Omit<
      Experience,
      "id" | "user_id" | "created_at" | "updated_at"
    >,
  ) {
    return this.request<Experience>("/experiences", {
      method: "POST",
      body: JSON.stringify(experience),
    });
  }

  async updateExperience(id: number, experience: Partial<Experience>) {
    return this.request<Experience>(`/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(experience),
    });
  }

  async deleteExperience(id: number) {
    return this.request(`/experiences/${id}`, { method: "DELETE" });
  }

  async getEducation() {
    return this.request<Education[]>("/education");
  }

  async createEducation(
    education: Omit<Education, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    return this.request<Education>("/education", {
      method: "POST",
      body: JSON.stringify(education),
    });
  }

  async updateEducation(id: number, education: Partial<Education>) {
    return this.request<Education>(`/education/${id}`, {
      method: "PUT",
      body: JSON.stringify(education),
    });
  }

  async deleteEducation(id: number) {
    return this.request(`/education/${id}`, { method: "DELETE" });
  }

  async getProjects() {
    return this.request<Project[]>("/projects");
  }

  async createProject(
    project: Omit<Project, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    return this.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: number, project: Partial<Project>) {
    return this.request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: number) {
    return this.request(`/projects/${id}`, { method: "DELETE" });
  }

  async getCertifications() {
    return this.request<Certification[]>("/certifications");
  }

  async createCertification(
    cert: Omit<Certification, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    return this.request<Certification>("/certifications", {
      method: "POST",
      body: JSON.stringify(cert),
    });
  }

  async updateCertification(id: number, cert: Partial<Certification>) {
    return this.request<Certification>(`/certifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(cert),
    });
  }

  async deleteCertification(id: number) {
    return this.request(`/certifications/${id}`, { method: "DELETE" });
  }

  async getDocuments() {
    return this.request<Document[]>("/documents");
  }

  async uploadDocument(file: File, isCv: boolean = false) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_cv", String(isCv));

    const headers: HeadersInit = {};
    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        extractErrorMessage(errorBody, `HTTP error ${response.status}`),
      );
    }

    return response.json();
  }

  async createDocument(
    document: Omit<Document, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    return this.request<Document>("/documents", {
      method: "POST",
      body: JSON.stringify(document),
    });
  }

  private async fetchDocument(
    id: number,
    action: "preview" | "download",
  ): Promise<Blob> {
    const headers: HeadersInit = {};
    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/${id}/${action}`, {
      headers,
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        extractErrorMessage(errorBody, `HTTP error ${response.status}`),
      );
    }
    return response.blob();
  }

  async previewDocument(id: number): Promise<Uint8Array> {
    const response = await this.request<{ data: string }>(`/documents/${id}/preview`);
    const binary = atob(response.data);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  async getDocumentFile(id: number, name: string, fileType: string): Promise<{ file: File; data: string }> {
    const response = await this.request<{ data: string }>(`/documents/${id}/drag-data`);
    const binary = atob(response.data);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    };
    const file = new File([bytes], name, { type: mimeTypes[fileType.toLowerCase()] || "application/octet-stream" });
    return { file, data: response.data };
  }

  async downloadDocument(id: number): Promise<Blob> {
    return this.fetchDocument(id, "download");
  }

  async deleteDocument(id: number) {
    return this.request(`/documents/${id}`, { method: "DELETE" });
  }

  async getPosts() {
    return this.request<Post[]>("/posts");
  }

  async createPost(
    post: Omit<Post, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    return this.request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(post),
    });
  }

  async getPost(id: number) {
    return this.request<Post>(`/posts/${id}`);
  }

  async updatePost(id: number, post: Partial<Post>) {
    return this.request<Post>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(post),
    });
  }

  async deletePost(id: number) {
    return this.request(`/posts/${id}`, { method: "DELETE" });
  }

  async getPostVersions(postId: number) {
    return this.request<PostVersion[]>(`/posts/${postId}/versions`);
  }

  async createPostVersion(
    postId: number,
    version: Omit<PostVersion, "id" | "post_id" | "created_at" | "updated_at">,
  ) {
    return this.request<PostVersion>(`/posts/${postId}/versions`, {
      method: "POST",
      body: JSON.stringify(version),
    });
  }

  async getPlatforms(category?: PlatformCategory) {
    const params = category ? `?category=${category}` : "";
    return this.request<Platform[]>(`/platforms${params}`);
  }
}

export const api = new ApiClient();
