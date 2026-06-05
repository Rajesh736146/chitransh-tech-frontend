import api from "@/lib/axios";

export interface UploadResponse {
  key: string;
  url: string;
  content_type: string;
}

export const uploadApi = {
  uploadImage: (file: File, folder = "images") => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<UploadResponse>("/upload/image", formData, {
        params: { folder },
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  uploadDocument: (file: File, folder = "documents") => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<UploadResponse>("/upload/document", formData, {
        params: { folder },
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteFile: (key: string) =>
    api.delete<{ message: string; key: string }>("/upload", { params: { key } }).then((r) => r.data),
};
