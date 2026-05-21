import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import prisma from "../prisma/db";
import { sendVerificationEmail } from "../services/email.service";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  address: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const isProd = process.env.NODE_ENV === "production";

const setTokenCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const user = await authService.signupUser(validatedData);
    
    // We only create token / set cookie if they are already verified (e.g. admin or bypassed verification)
    if (user.isVerified) {
      const token = authService.generateToken(user.id);
      setTokenCookie(res, token);
      return res.status(201).json({
        message: "User created successfully",
        user,
        token,
      });
    }

    res.status(201).json({
      message: "User created successfully. verification code has been sent to your email.",
      user,
      unverified: true,
    });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;

  try {
    const user = await authService.loginUser(identifier, password);
    
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email address not verified",
        unverified: true,
        email: user.email,
      });
    }
    
    const token = authService.generateToken(user.id);
    setTokenCookie(res, token);

    res.json({
      message: "Logged in successfully",
      user,
      token,
    });
  } catch (error: any) {
    next(error);
  }
};

export const verifyCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "Account is already verified" });
    }

    if (user.verificationCode !== code.toString().trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Verify user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null
      }
    });

    // Automatically log in on verification!
    const token = authService.generateToken(updatedUser.id);
    setTokenCookie(res, token);

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: "Email verified successfully!",
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    next(error);
  }
};

export const resendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { verificationCode: newCode }
    });

    await sendVerificationEmail(user.email, user.name, newCode);

    res.json({
      message: "A fresh verification code has been dispatched to your email address."
    });
  } catch (error: any) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req: any, res: Response) => {
  res.json({ user: req.user });
};

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  address: z.string().optional(),
  houseNo: z.string().optional(),
  streetNear: z.string().optional(),
  road: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updated = await authService.updateUserProfile(req.user.id, validatedData);
    res.json({
      message: "Profile updated successfully",
      user: updated
    });
  } catch (error: any) {
    next(error);
  }
};

