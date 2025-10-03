import { $Enums, PrismaClient, User } from "@prisma/client";
import BaseRepository from "./base.repository.js";
import { PaginationParams } from "../types/api.type.js";

class UserRepository implements BaseRepository<User> {
  findAll(
    paginationParams?: PaginationParams
  ): Promise<{ items: User[]; total: number }> {
    throw new Error("Method not implemented.");
  }
  create(item: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    throw new Error("Method not implemented.");
  }
  update(
    id: string,
    item: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  private prisma = new PrismaClient();

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

export default UserRepository;
