import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const apiRoleService = {
    getAllRoles: async (queryParams,includeDeleted) => {
        try {
            const response = await apiClient.get("/role",{
                params: { ...queryParams,includeDeleted },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch roles." };
        }
    },

    getDeletedRoles: async (queryParams) => {
        try {
            const response = await apiClient.get("/role/deleted",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch deleted roles." };
        }
    },

    getRoleById: async (id,includeDeleted) => {
        try {
            const response = await apiClient.get(`/role/${id}`,{ params: { includeDeleted } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch role." };
        }
    },

    createRole: async (roleDto) => {
        try {
            const response = await apiClient.post("/role",roleDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create role." };
        }
    },

    updateRole: async (id,roleDto) => {
        try {
            const response = await apiClient.put(`/role/${id}`,roleDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update role." };
        }
    },

    softDeleteRole: async (id) => {
        try {
            const response = await apiClient.delete(`/role/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to soft delete role." };
        }
    },

    softDeleteMultipleRoles: async (roleIds) => {
        try {
            const response = await apiClient.delete("/role/soft/multiple",{ data: roleIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to soft delete multiple roles." };
        }
    },

    hardDeleteRole: async (id) => {
        try {
            const response = await apiClient.delete(`/role/hard/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to hard delete role." };
        }
    },

    hardDeleteMultipleRoles: async (roleIds) => {
        try {
            const response = await apiClient.delete("/role/hard/multiple",{ data: roleIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to hard delete multiple roles." };
        }
    },

    restoreRole: async (id) => {
        try {
            const response = await apiClient.post(`/role/restore/${id}`);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Failed to restore role." };
        }
    },

    restoreMultipleRoles: async (roleIds) => {
        try {
            const response = await apiClient.post("/role/restore/multiple",roleIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to restore multiple roles." };
        }
    },

    restoreAllRoles: async () => {
        try {
            const response = await apiClient.post("/role/restore/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to restore all roles." };
        }
    },

    getAllPermissions: async (queryParams,includeDeleted) => {
        try {
            const response = await apiClient.get("/permission",{
                params: { ...queryParams,includeDeleted },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch permissions." };
        }
    },

    getRolePermissionsByRoleId: async (roleId,queryParams,includeDeleted) => {
        try {
            const response = await apiClient.get(`/role-permission/role/${roleId}`,{
                params: { ...queryParams,includeDeleted },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch role permissions." };
        }
    },

    assignPermission: async (rolePermissionDto) => {
        try {
            const response = await apiClient.post("/role-permission",rolePermissionDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to assign permission." };
        }
    },

    softDeletePermission: async (permissionId) => {
        try {
            const response = await apiClient.delete(`/permission/${permissionId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to soft delete permission." };
        }
    },

    getDeletedPermissions: async (queryParams) => {
        try {
            const response = await apiClient.get("/permission/deleted",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch deleted permissions." };
        }
    },

    getPermissionById: async (id,includeDeleted) => {
        try {
            const response = await apiClient.get(`/permission/${id}`,{ params: { includeDeleted } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch permission." };
        }
    },

    createPermission: async (permissionDto) => {
        try {
            const response = await apiClient.post("/permission",permissionDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create permission." };
        }
    },

    updatePermission: async (id,permissionDto) => {
        try {
            const response = await apiClient.put(`/permission/${id}`,permissionDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update permission." };
        }
    },

    hardDeletePermission: async (id) => {
        try {
            const response = await apiClient.delete(`/permission/hard/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to hard delete permission." };
        }
    },

    hardDeleteMultiplePermissions: async (permissionIds) => {
        try {
            const response = await apiClient.delete("/permission/hard/multiple",{ data: permissionIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to hard delete multiple permissions." };
        }
    },

    hardDeleteAllPermissions: async () => {
        try {
            const response = await apiClient.delete("/permission/hard/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to hard delete all permissions." };
        }
    },

    restorePermission: async (id) => {
        try {
            const response = await apiClient.post(`/permission/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to restore permission." };
        }
    },

    restoreMultiplePermissions: async (permissionIds) => {
        try {
            const response = await apiClient.post("/permission/restore/multiple",permissionIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to restore multiple permissions." };
        }
    },

    restoreAllPermissions: async () => {
        try {
            const response = await apiClient.post("/permission/restore/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to restore all permissions." };
        }
    },

    getRoleStatistics: async (params) => {
        try {
            const response = await apiClient.get("/role/statistics",{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch role statistics." };
        }
    },

    getPermissionStatistics: async (params) => {
        try {
            const response = await apiClient.get("/permission/statistics",{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch permission statistics." };
        }
    },
};

export default apiRoleService;