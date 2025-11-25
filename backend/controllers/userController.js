import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt' // correct package name

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here'
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || '24h'
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10)

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

// REGISTER FUNCTION
export async function registerUser(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    })
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email.'
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters.'
    })
  }

  try {
    // normalize email (optional but recommended)
    const normalizedEmail = validator.normalizeEmail(email)

    // check existing user
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already exists.'
      })
    }

    // hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed
    })

    const token = createToken(user._id);
    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
}

// LOGIN FUNCTION
export async function loginUser(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required.'
    })
  }

  try {
    const normalizedEmail = validator.normalizeEmail(email)
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    const token = createToken(user._id)
    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
}
