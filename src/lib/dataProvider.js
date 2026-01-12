import { stringify } from 'query-string';
import { fetchUtils } from 'react-admin';
import { normalizeResourceData } from './normalizeResourceData';

const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, { ...options, headers });
};

const wrapImageFields = (record) => {
  const copy = { ...record };

  // Wrap top-level image if string
  if (copy.image && typeof copy.image === 'string') {
    copy.image = { src: copy.image };
  }
  if (copy.icon && typeof copy.icon === 'string') {
    copy.icon = { src: copy.icon };
  }

  // Wrap translations.*.seoImage
  if (copy.translations && typeof copy.translations === 'object') {
    const newTranslations = {};

    for (const locale in copy.translations) {
      const t = copy.translations[locale];
      newTranslations[locale] = {
        ...t,
        seoImage: t?.seoImage && typeof t.seoImage === 'string' ? { src: t.seoImage } : t?.seoImage || null,
      };
    }

    copy.translations = newTranslations;
  }

  return copy;
};

export const dataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filters = { ...params.filter };
    const isGetAll = filters.getAll;
    delete filters.getAll;

    const query = {
      _sort: field,
      _order: order,
      [params.target]: params.id,
      ...params.filter,
    };

    if (!isGetAll) {
      query._page = page;
      query._limit = perPage;
    }

    // const query = {
    //   _page: page,
    //   _limit: perPage,
    //   _sort: field,
    //   _order: order,
    //   ...params.filter,
    // };

    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const response = await authFetch(url);

    const rawList = response.json?.data || [];
    const total = response.json?.total || rawList.length;

    const wrappedList = rawList.map(wrapImageFields);
    return {
      data: wrappedList,
      total,
    };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const response = await authFetch(url);
    return { data: wrapImageFields(response.json) };
  },

  create: async (resource, params) => {
    const data = await normalizeResourceData(params.data);
    const response = await authFetch(`${apiUrl}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.status >= 400) {
      throw new Error(response.json?.message || 'Error creating resource');
    }

    return { data: response.json };
  },

  update: async (resource, params) => {
    const data = await normalizeResourceData(params.data);

    let url;

    if (resource.startsWith('properties/')) {
      const subPath = resource.replace('properties/', '');
      url = `${apiUrl}/properties/${params.id}/${subPath}`;
    } else {
      url = `${apiUrl}/${resource}/${params.id}`;
    }
    const response = await authFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.status >= 400) {
      throw new Error(response.json?.message || 'Error updating resource');
    }

    return { data: response.json };
  },

  delete: async (resource, params) => {
    const response = await authFetch(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    });

    if (response.status >= 400) {
      throw new Error('Error deleting resource');
    }

    return { data: { id: params.id } };
  },

  deleteMany: async (resource, params) => {
    const response = await authFetch(`${apiUrl}/${resource}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: params.ids }), // send array of ids
    });

    if (response.status >= 400) {
      throw new Error('Error deleting resources');
    }

    return { data: params.ids };
  },

  getMany: async (resource, params) => {
    const query = stringify({ id: params.ids });
    const url = `${apiUrl}/${resource}?${query}`;
    const response = await authFetch(url);
    return { data: response.json?.data || response.json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination || {};
    const { field, order } = params.sort || {};
    const filters = { ...params.filter };
    const isGetAll = filters.getAll;
    delete filters.getAll;

    const query = {
      _sort: field,
      _order: order,
      [params.target]: params.id,
      ...params.filter,
    };

    if (!isGetAll) {
      query._page = page;
      query._limit = perPage;
    }

    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const response = await authFetch(url);

    const rawList = response.json?.data || [];
    const total = response.json?.total || rawList.length;

    return {
      data: rawList,
      total,
    };
  },
};
