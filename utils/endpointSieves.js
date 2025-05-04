class EndpointSieves {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filters() {
    const queryCopy = { ...this.queryStr };

    // Fields to remove that shouldn't be used for filtering
    const fieldsToRemove = ["keyword", "page"];
    fieldsToRemove.forEach((el) => delete queryCopy[el]);

    const filterQuery = {};

    // Convert fields like price[gte] into Mongo syntax
    Object.keys(queryCopy).forEach((key) => {
      if (key.includes("[")) {
        const [field, operator] = key.split("[");
        const op = operator.replace("]", "");

        if (!filterQuery[field]) filterQuery[field] = {};
        filterQuery[field][`$${op}`] = Number(queryCopy[key]); // Parse number
      } else {
        filterQuery[key] = queryCopy[key];
      }
    });

    this.query = this.query.find(filterQuery);
    return this;
  }

  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resPerPage * (currentPage - 1);
    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

export default EndpointSieves;