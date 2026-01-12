const authProvider = {
  login: async ({ username, password }) => {
    const email = username;
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // important for session cookies
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('admin', JSON.stringify(data.admin));

    // No JWT needed, session is set on backend
    return Promise.resolve();
  },

  logout: async () => {
    const res = await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Logout failed');
    }
    localStorage.removeItem('admin');

    return Promise.resolve();
  },

  checkAuth: async () => {
    const response = await fetch('/api/admin/check-auth', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.admin) {
        localStorage.setItem('admin', JSON.stringify(data.admin));
      }
      return Promise.resolve();
    } else {
      localStorage.removeItem('admin');
      return Promise.reject();
    }
  },

  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('admin');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: async () => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (admin.email === 'admin@admin.com') {
      // ✅ grant full access
      return Promise.resolve([{ resource: '*', action: '*' }]);
    }
    return admin?.permissions || [];
  },

  canAccess: async (params) => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const permissions = admin?.permissions || [];

    if (admin.email === 'admin@admin.com') {
      // ✅ super admin bypasses all checks
      return { authorized: true };
    }

    const { resource, action } = params;

    const authorized = permissions.some(
      (p) => p.resource === resource && p.action === action, // allow "manage" as wildcard
    );

    return { authorized };
  },

  getIdentity: () => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (!admin) return Promise.reject();
    return Promise.resolve({
      id: admin.id,
      fullName: admin.name,
      role: admin.role.name,
    });
  },
};

export default authProvider;
