import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/db';
import { AppError } from '../middleware/error.middleware';
import { sendVerificationEmail } from './email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export const signupUser = async (data: any) => {
  const { email, phone, password, ...rest } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let locationUrl = null;
  if (data.latitude && data.longitude) {
    locationUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = adminEmail && email.toLowerCase().trim() === adminEmail;
  const isVerified = isAdmin;

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      locationUrl,
      role: isAdmin ? 'ADMIN' : 'USER',
      isVerified,
      verificationCode,
    },
  });

  if (!isVerified) {
    // Dispatch email asynchronously
    sendVerificationEmail(user.email, user.name, verificationCode).catch(err => {
      console.error("❌ Failed to transmit verification email on signup:", err);
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginUser = async (identifier: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email/phone or password', 401);
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const { email, phone, name, address, houseNo, streetNear, road, district, state, pincode } = data;

  if (email) {
    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId }
      }
    });
    if (existing) {
      throw new AppError('Email is already in use by another account', 400);
    }
  }

  if (phone) {
    const existing = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: userId }
      }
    });
    if (existing) {
      throw new AppError('Phone number is already in use by another account', 400);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      phone,
      address,
      houseNo,
      streetNear,
      road,
      district,
      state,
      pincode
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      address: true,
      houseNo: true,
      streetNear: true,
      road: true,
      district: true,
      state: true,
      pincode: true,
    }
  });

  return updated;
};

