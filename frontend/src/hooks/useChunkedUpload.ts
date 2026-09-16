import { useCallback, useState } from "react";
import { api } from "../services/api";

interface UploadParams {
  file: File;
  recipientEmail: string;
  ttlHours: number;
  subject?: string;
  message?: string;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  uploadedBytes: number;
  error: string | null;
}

export function useChunkedUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    uploadedBytes: 0,
    error: null,
  });

  const upload = useCallback(async (params: UploadParams) => {
    const { file, recipientEmail, ttlHours, subject, message } = params;
    setState({ uploading: true, progress: 0, uploadedBytes: 0, error: null });

    try {
      const initRes = await api.post("/upload/init", {
        filename: file.name,
        file_size: file.size,
        recipient_email: recipientEmail,
        ttl_hours: ttlHours,
        subject: subject || undefined,
        message: message || undefined,
      });
      const { upload_id: uploadId, chunk_size: chunkSize } = initRes.data;

      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedBytes = 0;

      for (let index = 0; index < totalChunks; index++) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);

        await api.put(`/upload/${uploadId}/chunk/${index}`, blob, {
          headers: { "Content-Type": "application/octet-stream" },
        });

        uploadedBytes += blob.size;
        const progress = Math.round((uploadedBytes / file.size) * 100);
        setState({ uploading: true, progress, uploadedBytes, error: null });
      }

      const completeRes = await api.post(`/upload/${uploadId}/complete`, {
        upload_id: uploadId,
        total_chunks: totalChunks,
      });

      setState({ uploading: false, progress: 100, uploadedBytes: file.size, error: null });
      return completeRes.data;
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? "Yükleme başarısız oldu.";
      setState({ uploading: false, progress: 0, uploadedBytes: 0, error: message });
      throw err;
    }
  }, []);

  return { ...state, upload };
}
