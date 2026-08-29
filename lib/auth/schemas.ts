import { z } from 'zod';
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '@/lib/auth/password';

const strongPassword = z
  .string()
  .min(1, 'Password is required')
  .refine(isStrongPassword, PASSWORD_RULE_MESSAGE);

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export const signinSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
});

export const verifyAccountSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
});

export const signupSchema = z
  .object({
    accountKind: z.enum(['direct', 'agency']),
    companyName: z.string().trim().max(120, 'Business name is too long').optional().or(z.literal('')),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name is too long'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    mobile: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((value) => !value || /^[0-9]{10}$/.test(value), {
        message: 'Enter a 10-digit mobile number',
      }),
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .superRefine((values, ctx) => {
    if (values.accountKind === 'direct' && !values.companyName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message: 'Business name is required',
      });
    }
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type EmailFormValues = z.infer<typeof emailSchema>;
export type SigninFormValues = z.infer<typeof signinSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type VerifyAccountFormValues = z.infer<typeof verifyAccountSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
