type SortOrder = 1 | -1;
interface QueryOptions {
  sort?: Record<string, SortOrder>;
  skip?: number;
  limit?: number;
}

export function extractQueryOptions(query: Record<string, any>): QueryOptions {
  const { sortBy, order, page, limit } = query;
  const options: QueryOptions = {};

  // Sort
  if (sortBy) {
    options.sort = {
      [sortBy]: order === "desc" ? -1 : 1,
    };
  }

  // Pagination
  const pageNum = parseInt(page || "1");
  const limitNum = parseInt(limit || "10");

  if (!isNaN(pageNum) && !isNaN(limitNum)) {
    options.skip = (pageNum - 1) * limitNum;
    options.limit = limitNum;
  }

  return options;
}

