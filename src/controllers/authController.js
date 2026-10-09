import bcrypt from 'bcrypt';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';

import { Session } from '../models/session.js';
import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

const resetPasswordTemplatePath = fileURLToPath(
  new URL('../templates/reset-password-email.html', import.meta.url),
);
const passwordResetSuccess = {
  message: 'Password reset email sent successfully',
};

const clearSessionCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  res.clearCookie('sessionId', cookieOptions);
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser !== null) {
    throw createHttpError(400, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });
  const session = await createSession(user._id);

  setSessionCookies(res, session);
  res.status(201).json(user);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user === null) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });
  const session = await createSession(user._id);

  setSessionCookies(res, session);
  res.status(200).json(user);
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!isValidObjectId(sessionId)) {
    throw createHttpError(401, 'Session not found');
  }

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (session === null) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: session._id });
    clearSessionCookies(res);
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({ _id: session._id });
  const newSession = await createSession(session.userId);

  setSessionCookies(res, newSession);
  res.status(200).json({ message: 'Session refreshed' });
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (isValidObjectId(sessionId)) {
    await Session.deleteOne({ _id: sessionId });
  }

  clearSessionCookies(res);
  res.status(204).send();
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user === null) {
    res.status(200).json(passwordResetSuccess);
    return;
  }

  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: '15m',
    },
  );
  const resetUrl = new URL('/reset-password', process.env.FRONTEND_DOMAIN);
  resetUrl.searchParams.set('token', token);
  const templateSource = await readFile(resetPasswordTemplatePath, 'utf8');
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.username,
    link: resetUrl.toString(),
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json(passwordResetSuccess);
};

export const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  if (
    typeof payload !== 'object' ||
    !isValidObjectId(payload.sub) ||
    typeof payload.email !== 'string'
  ) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  });

  if (user === null) {
    throw createHttpError(404, 'User not found');
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
};
