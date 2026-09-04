import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../../../shared/prisma";
const issue = (user: { id: string; email: string; role: string }) =>
  jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
export const authService = {
  register: async (data: any) => {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: String(data.email).toLowerCase(),
        passwordHash: await argon2.hash(data.password),
      },
    });
    return {
      accessToken: issue(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
  login: async (data: any) => {
    const user = await prisma.user.findUnique({
      where: { email: String(data.email).toLowerCase() },
    });
    if (!user || !(await argon2.verify(user.passwordHash, data.password)))
      throw Object.assign(new Error("Invalid email or password"), {
        statusCode: 401,
      });
    return {
      accessToken: issue(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};
