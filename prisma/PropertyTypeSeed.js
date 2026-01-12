export async function PropertyTypeSeed(prisma) {
  // Define seed data
  const propertyTypes = [
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 1,
      status: true,
      translations: [
        { locale: 'en', name: 'House', description: 'A standalone home for your stay' },
        { locale: 'bn', name: 'বাড়ি', description: 'আপনার থাকার জন্য একটি স্বতন্ত্র বাড়ি' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 2,
      status: true,
      translations: [
        { locale: 'en', name: 'Apartment', description: 'A unit in a building complex' },
        { locale: 'bn', name: 'অ্যাপার্টমেন্ট', description: 'একটি ভবনের ইউনিট' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 4,
      status: true,
      translations: [
        { locale: 'en', name: 'Villa', description: 'A luxury villa with premium amenities' },
        { locale: 'bn', name: 'ভিলা', description: 'প্রিমিয়াম সুবিধাসম্পন্ন একটি বিলাসবহুল ভিলা' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 5,
      status: true,
      translations: [
        { locale: 'en', name: 'Cottage', description: 'A cozy cottage in a natural setting' },
        { locale: 'bn', name: 'কটেজ', description: 'প্রাকৃতিক পরিবেশে একটি আরামদায়ক কটেজ' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 3,
      status: true,
      translations: [
        { locale: 'en', name: 'Tent', description: 'An outdoor tent for adventurous stays' },
        { locale: 'bn', name: 'টেন্ট', description: 'অ্যাডভেঞ্চারাস থাকার জন্য একটি তাঁবু' },
      ],
    },

    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 6,
      status: true,
      translations: [
        { locale: 'en', name: 'Hotel', description: 'Budget-friendly shared accommodation' },
        { locale: 'bn', name: 'হোটেল', description: 'বাজেট-বান্ধব শেয়ার্ড থাকার ব্যবস্থা' },
      ],
    },
  ];

  for (const type of propertyTypes) {
    await prisma.propertyType.create({
      data: {
        icon: type.icon,
        order: type.order,
        status: type.status,
        propertyTypeTranslation: {
          create: type.translations,
        },
      },
    });
  }
  console.log('✅ Seed completed: propertyType.');
}
