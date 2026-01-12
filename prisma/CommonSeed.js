import bcryptjs from 'bcryptjs';

export async function CommonSeed(prisma) {
  // 1. Create permissions
  const permissionsList = [
    { action: 'list', resource: 'manage_settings' },
    { action: 'list', resource: 'manage_user' },
    { action: 'list', resource: 'manage_property_settings' },
    { action: 'list', resource: 'manage_experience_settings' },
    { action: 'list', resource: 'manage_amenities_settings' },
    { action: 'list', resource: 'manage_articles' },

    { action: 'list', resource: 'users' },
    { action: 'create', resource: 'users' },
    { action: 'edit', resource: 'users' },
    { action: 'show', resource: 'users' },
    { action: 'delete', resource: 'users' },

    { action: 'list', resource: 'stafs' },
    { action: 'create', resource: 'stafs' },
    { action: 'edit', resource: 'stafs' },
    { action: 'show', resource: 'stafs' },
    { action: 'delete', resource: 'stafs' },

    { action: 'list', resource: 'roles' },
    { action: 'create', resource: 'roles' },
    { action: 'edit', resource: 'roles' },
    { action: 'show', resource: 'roles' },
    { action: 'delete', resource: 'roles' },

    { action: 'list', resource: 'permissions' },
    { action: 'create', resource: 'permissions' },
    { action: 'edit', resource: 'permissions' },
    { action: 'show', resource: 'permissions' },
    { action: 'delete', resource: 'permissions' },

    { action: 'list', resource: 'logs' },
    { action: 'create', resource: 'logs' },
    { action: 'edit', resource: 'logs' },
    { action: 'show', resource: 'logs' },
    { action: 'delete', resource: 'logs' },

    { action: 'list', resource: 'payout-methods' },
    { action: 'create', resource: 'payout-methods' },
    { action: 'edit', resource: 'payout-methods' },
    { action: 'show', resource: 'payout-methods' },
    { action: 'delete', resource: 'payout-methods' },

    { action: 'list', resource: 'wallets' },
    { action: 'create', resource: 'wallets' },
    { action: 'edit', resource: 'wallets' },
    { action: 'show', resource: 'wallets' },
    { action: 'delete', resource: 'wallets' },

    { action: 'list', resource: 'payouts' },
    { action: 'create', resource: 'payouts' },
    { action: 'edit', resource: 'payouts' },
    { action: 'show', resource: 'payouts' },
    { action: 'delete', resource: 'payouts' },

    { action: 'list', resource: 'bookings' },
    { action: 'create', resource: 'bookings' },
    { action: 'edit', resource: 'bookings' },
    { action: 'show', resource: 'bookings' },
    { action: 'delete', resource: 'bookings' },

    { action: 'list', resource: 'properties' },
    { action: 'create', resource: 'properties' },
    { action: 'edit', resource: 'properties' },
    { action: 'show', resource: 'properties' },
    { action: 'delete', resource: 'properties' },

    { action: 'list', resource: 'property-types' },
    { action: 'create', resource: 'property-types' },
    { action: 'edit', resource: 'property-types' },
    { action: 'show', resource: 'property-types' },
    { action: 'delete', resource: 'property-types' },

    { action: 'list', resource: 'space-types' },
    { action: 'create', resource: 'space-types' },
    { action: 'edit', resource: 'space-types' },
    { action: 'show', resource: 'space-types' },
    { action: 'delete', resource: 'space-types' },

    { action: 'list', resource: 'bed-types' },
    { action: 'create', resource: 'bed-types' },
    { action: 'edit', resource: 'bed-types' },
    { action: 'show', resource: 'bed-types' },
    { action: 'delete', resource: 'bed-types' },

    { action: 'list', resource: 'experience' },
    { action: 'create', resource: 'experience' },
    { action: 'edit', resource: 'experience' },
    { action: 'show', resource: 'experience' },
    { action: 'delete', resource: 'experience' },

    { action: 'list', resource: 'experience-categories' },
    { action: 'create', resource: 'experience-categories' },
    { action: 'edit', resource: 'experience-categories' },
    { action: 'show', resource: 'experience-categories' },
    { action: 'delete', resource: 'experience-categories' },

    { action: 'list', resource: 'inclusions' },
    { action: 'create', resource: 'inclusions' },
    { action: 'edit', resource: 'inclusions' },
    { action: 'show', resource: 'inclusions' },
    { action: 'delete', resource: 'inclusions' },

    { action: 'list', resource: 'exclusions' },
    { action: 'create', resource: 'exclusions' },
    { action: 'edit', resource: 'exclusions' },
    { action: 'show', resource: 'exclusions' },
    { action: 'delete', resource: 'exclusions' },

    { action: 'list', resource: 'amenities' },
    { action: 'create', resource: 'amenities' },
    { action: 'edit', resource: 'amenities' },
    { action: 'show', resource: 'amenities' },
    { action: 'delete', resource: 'amenities' },

    { action: 'list', resource: 'amenity-types' },
    { action: 'create', resource: 'amenity-types' },
    { action: 'edit', resource: 'amenity-types' },
    { action: 'show', resource: 'amenity-types' },
    { action: 'delete', resource: 'amenity-types' },

    { action: 'list', resource: 'fees' },
    { action: 'create', resource: 'fees' },
    { action: 'edit', resource: 'fees' },
    { action: 'show', resource: 'fees' },
    { action: 'delete', resource: 'fees' },

    { action: 'list', resource: 'reviews' },
    { action: 'create', resource: 'reviews' },
    { action: 'edit', resource: 'reviews' },
    { action: 'show', resource: 'reviews' },
    { action: 'delete', resource: 'reviews' },

    { action: 'list', resource: 'messages' },
    { action: 'create', resource: 'messages' },
    { action: 'edit', resource: 'messages' },
    { action: 'show', resource: 'messages' },
    { action: 'delete', resource: 'messages' },

    { action: 'list', resource: 'help-categories' },
    { action: 'create', resource: 'help-categories' },
    { action: 'edit', resource: 'help-categories' },
    { action: 'show', resource: 'help-categories' },
    { action: 'delete', resource: 'help-categories' },

    { action: 'list', resource: 'helps' },
    { action: 'create', resource: 'helps' },
    { action: 'edit', resource: 'helps' },
    { action: 'show', resource: 'helps' },
    { action: 'delete', resource: 'helps' },

    { action: 'list', resource: 'cancellation-policy' },
    { action: 'create', resource: 'cancellation-policy' },
    { action: 'edit', resource: 'cancellation-policy' },
    { action: 'show', resource: 'cancellation-policy' },
    { action: 'delete', resource: 'cancellation-policy' },


    { action: 'list', resource: 'countries' },
    { action: 'create', resource: 'countries' },
    { action: 'edit', resource: 'countries' },
    { action: 'show', resource: 'countries' },
    { action: 'delete', resource: 'countries' },

    { action: 'list', resource: 'states' },
    { action: 'create', resource: 'states' },
    { action: 'edit', resource: 'states' },
    { action: 'show', resource: 'states' },
    { action: 'delete', resource: 'states' },

    { action: 'list', resource: 'cities' },
    { action: 'create', resource: 'cities' },
    { action: 'edit', resource: 'cities' },
    { action: 'show', resource: 'cities' },
    { action: 'delete', resource: 'cities' },

    { action: 'list', resource: 'currencies' },
    { action: 'create', resource: 'currencies' },
    { action: 'edit', resource: 'currencies' },
    { action: 'show', resource: 'currencies' },
    { action: 'delete', resource: 'currencies' },

    { action: 'list', resource: 'languages' },
    { action: 'create', resource: 'languages' },
    { action: 'edit', resource: 'languages' },
    { action: 'show', resource: 'languages' },
    { action: 'delete', resource: 'languages' },

    { action: 'list', resource: 'translations' },
    { action: 'create', resource: 'translations' },
    { action: 'edit', resource: 'translations' },
    { action: 'show', resource: 'translations' },
    { action: 'delete', resource: 'translations' },
  ];

  const permissions = await prisma.permission.createMany({
    data: permissionsList,
  });

  const allPermissions = await prisma.permission.findMany();

  // 2. Create Super Admin role with all permissions
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'Super Admin',
      permissions: {
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // 3. Create Super Admin user
  const hashedPassword = await bcryptjs.hash('password', 10); // Replace with a secure password
  await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@admin.com',
      phone: '+8801744968888',
      password: hashedPassword,
      role: {
        connect: { id: superAdminRole.id },
      },
    },
  });

  await prisma.language.createMany({
    data: [
      { name: 'English', code: 'en', defaultLanguage: true },
      { name: 'Bengali', code: 'bn', defaultLanguage: false },
    ],
    skipDuplicates: true,
  });

  await prisma.translation.create({
    data: {
      key: 'Home',
      locale: 'en',
      value: 'Home',
    },
  });

  await prisma.propertyFees.create({
    data: {
      guestFee: 14.0,
      hostFee: 3.0,
    },
  });

  console.log('✅ Seed completed: Permission, Role, Admin, Language, Translation and PropertyFees.');
}
