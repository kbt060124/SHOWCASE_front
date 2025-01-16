export interface UploadModalProps {
    file: File;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
}

export interface UploadFormData {
    name: string;
    memo: string;
    thumbnail: File | null;
}
