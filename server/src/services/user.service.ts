import { CreateUserInput, UserDto } from '@salary/shared';
import prisma from '@config/database';
import { User } from '../generated/prisma/client';
import { hashPassword } from '@utils/password';

const toDto = (user: User): UserDto => ({
  id: user.id,
  email: user.email,
  username: user.username,
  designation: user.designation,
  createdAt: user.createdAt,
});

export const listUsers = async (): Promise<UserDto[]> => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  return users.map(toDto);
};

// Admin-provisioned HR account (PRD: accounts are admin-created). Duplicate
// email/username surface as a Prisma P2002 → the fail envelope maps it to the
// offending field.
export const createUser = async (input: CreateUserInput): Promise<UserDto> => {
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      designation: input.designation,
      passwordHash: await hashPassword(input.password),
    },
  });
  return toDto(user);
};
