export async function SpaceTypeSeed(prisma) {
  const spaceTypes = [
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 1,
      status: true,
      translations: [
        { locale: 'en', name: 'Private Room', description: 'A room just for you in a shared place' },
        { locale: 'bn', name: 'প্রাইভেট রুম', description: 'একটি ভাগ করা জায়গায় শুধুমাত্র আপনার জন্য একটি রুম' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 2,
      status: true,
      translations: [
        { locale: 'en', name: 'Entire Place', description: 'You’ll have the whole place to yourself' },
        { locale: 'bn', name: 'পুরো স্থান', description: 'আপনি পুরো জায়গাটি একা ব্যবহার করতে পারবেন' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 3,
      status: true,
      translations: [
        { locale: 'en', name: 'Shared Room', description: 'A room you’ll share with others' },
        { locale: 'bn', name: 'শেয়ার্ড রুম', description: 'একটি রুম যা আপনি অন্যদের সাথে ভাগ করবেন' },
      ],
    },
  ];

  for (const type of spaceTypes) {
    const created = await prisma.spaceType.create({
      data: {
        icon: type.icon,
        order: type.order,
        status: type.status,
        spaceTypeTranslation: {
          create: type.translations,
        },
      },
    });
  }
  console.log('✅ Seed completed: spaceType.');
}
