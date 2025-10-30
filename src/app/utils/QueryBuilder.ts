import { Query } from "mongoose";
import { excludedFields } from "./globalConstants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;
  public readonly modelType: string;
  
  constructor(
    modelQuery: Query<T[], T>,
    query: Record<string, string>,
    modelType: string
  ) {
    this.modelQuery = modelQuery;
    this.query = query;
    this.modelType = modelType;
  }
  
  filter(): this {
    const filter = { ...this.query };
    for (const field of excludedFields) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }
    this.modelQuery = this.modelQuery.find(filter);
    return this;
  }

  search(searchableFileds: string[]): this {
    const searchTerm = this.query?.searchTerm;
    
    if (!searchTerm) {
      return this;
    }
    
    const isNumber = !isNaN(Number(searchTerm)) && searchTerm !== "";

    const searchQuery = searchableFileds.map((field) => {
      if (isNumber) {
        if (this.modelType === "Transaction") {
          return { amount: Number(searchTerm) };
        } else if (this.modelType === "Wallet") {
          return { balance: Number(searchTerm) };
        }
      }

      return {
        [field]: { $regex: searchTerm, $options: "i" },
      };
    });

    this.modelQuery = this.modelQuery.find({ $or: searchQuery });
    return this;
  }

  sort(): this {
    const sort = this.query?.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  field(): this {
    const field = this.query?.field?.split(",").join(" ") || "";
    this.modelQuery = this.modelQuery.select(field);
    return this;
  }

  paginate(): this {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const filter = this.modelQuery.getFilter();
    const totalCount = await this.modelQuery.model.countDocuments(filter);
    
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    
    return {
      page,
      limit,
      total: totalCount,
      totalPage: Math.ceil(totalCount / limit),
    };
  }
}