// src/exporters/fetchAllRecords.js
export const fetchAllRecords = async (dataProvider, resource) => {
  let page = 1;
  const perPage = 100;
  let all = [];
  let done = false;

  while (!done) {
    const { data, total } = await dataProvider.getList(resource, {
      pagination: { page, perPage },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    all = [...all, ...data];

    if (all.length >= total || data.length === 0) {
      done = true;
    } else {
      page++;
    }
  }

  return all;
};
