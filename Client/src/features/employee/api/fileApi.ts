import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export const uploadFileApi = async (file: File): Promise<{ success: boolean; data: { file_url: string; file_name: string }; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(ENDPOINTS.UPLOAD.SINGLE, formData);
    return response.data;
};

export const uploadMultipleFilesApi = async (files: FileList | File[]): Promise<{ success: boolean; data: { file_url: string; file_name: string }[]; message?: string }> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    const response = await axiosInstance.post(ENDPOINTS.UPLOAD.MULTIPLE, formData);
    return response.data;
};
