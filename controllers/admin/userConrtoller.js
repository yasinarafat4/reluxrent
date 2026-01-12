const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');
const bcryptjs = require('bcryptjs');

// List all users
exports.getUsers = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const q = req.query.q ? req.query.q : '';
    const status = req.query.status;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {};
    if (ids.length > 0) {
      filter = { id: { in: ids.map((id) => id) } }; // Handle multiple IDs or a single ID
    }
    if (q) {
      filter = {
        ...filter,
        OR: [{ name: { contains: q } }],
      };
    }

    if (status) {
      filter = {
        ...filter,
        status: status === 'true' ? true : status === 'false' ? false : undefined,
      };
    }

    const queryOptions = {
      where: filter,
      orderBy: {
        [sortField]: sortOrder,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.user.findMany(queryOptions), prisma.user.count({ where: filter })]);
    res.setHeader('Content-Range', `users ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  const { name, preferredName, email, phone, dob, about, dreamPlace, funFact, myWork, obsessedWith, school, address, languages, isHost, isVerified, guestFee, hostFee, password } = req.body;

  console.log('Create User DOB', dob);
  try {
    const errors = {};
    if (!name) {
      errors.title = 'The Name is required';
    }
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      errors.email = 'An account with this email already exists. Please use a different email.';
    }
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      errors.phone = 'An account with this phone already exists. Please use a different phone.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        errors: errors,
      });
    }
    const pass = await bcryptjs.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        preferredName,
        email,
        phone,
        dob: dob ? new Date(dob) : null,
        about,
        dreamPlace,
        funFact,
        myWork,
        obsessedWith,
        school,
        address,
        languages,
        isHost,
        isVerified,
        guestFee,
        hostFee,
        password: pass,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Users',
      resourceId: String(user.id),
      message: `Created User ${user.id}`,
      changes: { after: user },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, preferredName, email, phone, dob, about, dreamPlace, funFact, myWork, obsessedWith, school, address, languages, isHost, isVerified, guestFee, hostFee, password } = req.body;
  console.log('Update User DOB', dob);
  try {
    const updateData = {
      name,
      preferredName,
      email,
      phone,
      dob: dob ? new Date(dob) : null,
      about,
      dreamPlace,
      funFact,
      myWork,
      obsessedWith,
      school,
      address,
      languages,
      isHost,
      isVerified,
      guestFee,
      hostFee,
    };

    if (password) {
      updateData.password = await bcryptjs.hash(password, 10);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Users',
      resourceId: String(id),
      message: `Updated User ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
      include: { permissions: true },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Users',
      resourceId: String(id),
      message: `Deleted User ${id}`,
      changes: { before: deletedUser },
      meta: { ip: req.ip, route: req.originalUrl },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
};

exports.getVerificationDocuments = async (req, res) => {
  try {
    const id = req.params.id;
    const verificationData = await prisma.userVerification.findUnique({
      where: {
        userId: id,
      },
    });
    res.json(verificationData);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch Verification Documents' });
  }
};

exports.userVerify = async (req, res) => {
  try {
    const id = req.params.id;
    const verifyUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isVerified: true,
      },
    });
    res.status(201).json(verifyUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: 'Failed to update user verify' });
  }
};
