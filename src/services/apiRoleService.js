import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const apiRoleService = {
  getAllRoles: async (queryParams,includeDeleted) => {
    try {
      const response = await apiClient.get('/Role',{
        params: { ...queryParams,includeDeleted },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch roles.' };
    }
  },

  getDeletedRoles: async (queryParams) => {
    try {
      const response = await apiClient.get('/Role/deleted',{ params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch deleted roles.' };
    }
  },

  getRoleById: async (id,includeDeleted) => {
    try {
      const response = await apiClient.get(`/Role/${id}`,{ params: { includeDeleted } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch role.' };
    }
  },

  createRole: async (roleDto) => {
    try {
      const response = await apiClient.post('/Role',roleDto);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create role.' };
    }
  },

  updateRole: async (id,roleDto) => {
    try {
      const response = await apiClient.put(`/Role/${id}`,roleDto);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update role.' };
    }
  },

  softDeleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/Role/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to soft delete role.' };
    }
  },

  softDeleteMultipleRoles: async (roleIds) => {
    try {
      const response = await apiClient.delete('/Role/soft/multiple',{ data: roleIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to hard delete multiple roles.' };
    }
  },

  hardDeleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/Role/hard/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to hard delete role.' };
    }
  },

  hardDeleteMultipleRoles: async (roleIds) => {
    try {
      const response = await apiClient.delete('/Role/hard/multiple',{ data: roleIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to hard delete multiple roles.' };
    }
  },

  restoreRole: async (id) => {
    try {
      const response = await apiClient.post(`/Role/restore/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to restore role.' };
    }
  },

  restoreMultipleRoles: async (roleIds) => {
    try {
      const response = await apiClient.post('/Role/restore/multiple',roleIds);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to restore multiple roles.' };
    }
  },

  restoreAllRoles: async () => {
    try {
      const response = await apiClient.post('/Role/restore/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to restore all roles.' };
    }
  },

  getAllPermissions: async (queryParams,includeDeleted) => {
    try {
      const response = await apiClient.get('/Permission',{ params: { ...queryParams,includeDeleted } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch permissions.' };
    }
  },

  getRolePermissionsByRoleId: async (roleId,queryParams,includeDeleted) => {
    try {
      const response = await apiClient.get(`/RolePermission/role/${roleId}`,{ params: { ...queryParams,includeDeleted } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch role permissions.' };
    }
  },

  assignPermission: async (rolePermissionDto) => {
    try {
      const response = await apiClient.post('/RolePermission',rolePermissionDto);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign permission.' };
    }
  },

  softDeletePermission: async (permissionId) => {
    try {
      const response = await apiClient.delete(`/Permission/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove permission.' };
    }
  },

  getDeletedPermissions: async (queryParams) => {
    try {
      const response = await apiClient.get('/Permission/deleted',{ params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch deleted permissions.' };
    }
  },

  getPermissionById: async (id,includeDeleted) => {
    try {
      const response = await apiClient.get(`/Permission/${id}`,{ params: { includeDeleted } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch permission.' };
    }
  },

  createPermission: async (permissionDto) => {
    try {
      const response = await apiClient.post('/Permission',permissionDto);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create permission.' };
    }
  },

  updatePermission: async (id,permissionDto) => {
    try {
      const response = await apiClient.put(`/Permission/${id}`,permissionDto);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update permission.' };
    }
  },

  hardDeletePermission: async (id) => {
    try {
      const response = await apiClient.delete(`/Permission/hard/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to hard delete permission.' };
    }
  },

  hardDeleteMultiplePermissions: async (permissionIds) => {
    try {
      const response = await apiClient.delete('/Permission/hard/multiple',{ data: permissionIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to hard delete multiple permissions.' };
    }
  },

  hardDeleteAllPermissions: async () => {
    try {
      const response = await apiClient.delete('/Permission/hard/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to hard delete all permissions.' };
    }
  },

  restorePermission: async (id) => {
    try {
      const response = await apiClient.post(`/Permission/restore/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to restore permission.' };
    }
  },

  restoreMultiplePermissions: async (permissionIds) => {
    try {
      const response = await apiClient.post('/Permission/restore/multiple',permissionIds);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to restore multiple permissions.' };
    }
  },

  restoreAllPermissions: async () => {
    try {
      const response = await apiClient.post('/Permission/restore/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to restore all permissions.' };
    }
  },
  getRoleStatistics: async (params) => {
    try {
      const response = await apiClient.get('/Role/statistics',{ params });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },
  getPermissionStatistics: async (params) => {
    try {
      const response = await apiClient.get('/Permission/statistics',{ params });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },
};

export default apiRoleService;