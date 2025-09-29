import { PaginationParams } from "../types/api.type.js";

interface BaseRepository<T> {
    findAll(paginationParams?: PaginationParams): Promise<{ items: T[]; total: number }>;
    findById(id: string): Promise<T | null>;
    create(item: T): Promise<T>;
    update(id: string, item: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

export default BaseRepository;