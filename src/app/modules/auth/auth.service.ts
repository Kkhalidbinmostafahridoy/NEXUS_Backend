import argon2 from "argon2";
import jwt from "jsonwebtoken";

import { prisma } from "../../../shared/prisma";

type TokenUser = { id: string; email: string; role: string; organizationId: string };
const accessSecret = () => process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!;
const refreshSecret = () => process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!;

const issueTokens = async (user: TokenUser) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
  const accessToken = jwt.sign(payload, accessSecret(), { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, refreshSecret(), { expiresIn: "30d" });
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: await argon2.hash(refreshToken) },
  });
  return { accessToken, refreshToken };
};

const membershipFor = async (userId: string, organizationId?: string) => {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, ...(organizationId ? { organizationId } : {}) },
    orderBy: { id: "asc" },
  });
  if (!membership)
    throw Object.assign(new Error("No organization membership found"), { statusCode: 403 });
  return membership;
};

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    organizationName?: string;
  }) => {
    const email = String(data.email).toLowerCase();
    const baseSlug = String(data.organizationName ?? `${data.name}'s organization`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug || "organization"}-${crypto.randomUUID().slice(0, 8)}`;
    const { user, organization } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email,
          passwordHash: await argon2.hash(data.password),
          role: "OWNER",
        },
      });
      const organization = await tx.organization.create({
        data: { name: data.organizationName ?? `${data.name}'s Organization`, slug },
      });
      await tx.organizationMember.create({
        data: { userId: user.id, organizationId: organization.id, role: "OWNER" },
      });
      return { user, organization };
    });
    const tokens = await issueTokens({
      id: user.id,
      email: user.email,
      role: "OWNER",
      organizationId: organization.id,
    });
    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: "OWNER" },
      organization,
    };
  },
  login: async (data: { email: string; password: string; organizationId?: string }) => {
    const user = await prisma.user.findUnique({
      where: { email: String(data.email).toLowerCase() },
    });
    if (!user || !(await argon2.verify(user.passwordHash, data.password)))
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    if (user.status !== "ACTIVE")
      throw Object.assign(new Error("Account is not active"), { statusCode: 403 });
    const membership = await membershipFor(user.id, data.organizationId);
    const tokens = await issueTokens({
      id: user.id,
      email: user.email,
      role: membership.role,
      organizationId: membership.organizationId,
    });
    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: membership.role },
      organizationId: membership.organizationId,
    };
  },
  refresh: async (refreshToken: string) => {
    const payload = jwt.verify(refreshToken, refreshSecret()) as {
      sub: string;
      organizationId: string;
    };
    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    if (!user.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, refreshToken)))
      throw Object.assign(new Error("Refresh token has been revoked"), { statusCode: 401 });
    if (user.status !== "ACTIVE")
      throw Object.assign(new Error("Account is not active"), { statusCode: 403 });
    const membership = await membershipFor(user.id, payload.organizationId);
    return issueTokens({
      id: user.id,
      email: user.email,
      role: membership.role,
      organizationId: membership.organizationId,
    });
  },
  logout: (userId: string) =>
    prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } }),
  me: async (userId: string, organizationId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true },
    });
    const membership = await membershipFor(userId, organizationId);
    return { ...user, organizationId: membership.organizationId, role: membership.role };
  },
};
