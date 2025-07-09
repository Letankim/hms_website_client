import axios from "axios";

const ALLOWED_TYPES = ["image/jpeg","image/png","image/gif","image/bmp"];

const apiClient = axios.create({
    baseURL: "https://3docorp.id.vn",
    headers: {
        "X-API-Key": "3docorp_fixed_key_2025",
    },
});

export const apiUploadImageCloudService = {
    async uploadImage(formData,directory = null,user = null) {
        try {
            if (!(formData instanceof FormData)) {
                return { message: "Invalid FormData",isError: true,imageUrl: "" };
            }

            const file = formData.get("file");
            if (!file || !(file instanceof File)) {
                return { message: "Invalid file: must be a File instance",isError: true,imageUrl: "" };
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                return {
                    message: `Invalid image type. Only ${ALLOWED_TYPES.join(", ")} are allowed.`,
                    isError: true,
                    imageUrl: "",
                };
            }

            if (user !== null) {
                formData.append("user",user);
            }
            if (directory !== null) {
                formData.append("directory",directory);
            }

            const response = await apiClient.post("/index.php",formData,{
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 && response.data.imageUrl) {
                return { message: "Image uploaded successfully!",isError: false,imageUrl: response.data.imageUrl };
            } else {
                return { message: `Error: ${response.data.error || "Unknown error"}`,isError: true,imageUrl: "" };
            }
        } catch (error) {
            return { message: `Error: ${error.response?.data?.error || error.message || "Unknown error"}`,isError: true,imageUrl: "" };
        }
    },
};
