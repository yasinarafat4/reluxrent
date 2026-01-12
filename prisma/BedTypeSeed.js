export async function BedTypeSeed(prisma) {
  const bedTypes = [
    {
      order: 1,
      status: true,
      translations: [
        { locale: 'en', name: 'Single Bed' },
        { locale: 'bn', name: 'একক বিছানা' },
      ],
    },
    {
      order: 2,
      status: true,
      translations: [
        { locale: 'en', name: 'Double Bed' },
        { locale: 'bn', name: 'ডাবল বিছানা' },
      ],
    },
    {
      order: 3,
      status: true,
      translations: [
        { locale: 'en', name: 'Queen Bed' },
        { locale: 'bn', name: 'কুইন বিছানা' },
      ],
    },
    {
      order: 4,
      status: true,
      translations: [
        { locale: 'en', name: 'King Bed' },
        { locale: 'bn', name: 'কিং বিছানা' },
      ],
    },
    {
      order: 5,
      status: true,
      translations: [
        { locale: 'en', name: 'Sofa Bed' },
        { locale: 'bn', name: 'সোফা বিছানা' },
      ],
    },
  ];

  for (const bed of bedTypes) {
    const created = await prisma.bedType.create({
      data: {
        order: bed.order,
        status: bed.status,
        bedTypeTranslation: {
          create: bed.translations,
        },
      },
    });
  }
  console.log('✅ Seed completed: BedType.');
}
