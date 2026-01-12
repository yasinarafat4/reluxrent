export async function AmenitiesSeed(prisma) {
  // Create or fetch Amenities Types
  const commonType = await prisma.amenitiesType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      order: 1,
      status: true,
      amenitiesTypeTranslation: {
        create: [
          {
            locale: 'en',
            name: 'Common Amenities',
            description: 'Common Amenities available in the property.',
          },
          {
            locale: 'bn',
            name: 'সাধারণ সুবিধা',
            description: 'সম্পত্তিতে উপলব্ধ সাধারণ সুযোগ-সুবিধা।',
          },
        ],
      },
    },
  });

  const safetyType = await prisma.amenitiesType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      order: 2,
      status: true,
      amenitiesTypeTranslation: {
        create: [
          {
            locale: 'en',
            name: 'Safety Amenities',
            description: 'Safety Amenities available in the property.',
          },
          {
            locale: 'bn',
            name: 'নিরাপত্তা সুবিধা',
            description: 'সম্পত্তিতে উপলব্ধ নিরাপত্তা সুবিধা।',
          },
        ],
      },
    },
  });

  // Amenities under each type
  const commonAmenitiesData = [
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 1,
      status: true,
      translations: [
        { locale: 'en', name: 'Wi-Fi', description: 'Free wireless internet' },
        { locale: 'bn', name: 'ওয়াই-ফাই', description: 'বিনামূল্যে ওয়্যারলেস ইন্টারনেট' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 2,
      status: true,
      translations: [
        { locale: 'en', name: 'Parking', description: 'Secure car parking' },
        { locale: 'bn', name: 'পার্কিং', description: 'নিরাপদ গাড়ি পার্কিং' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 3,
      status: true,
      translations: [
        { locale: 'en', name: 'Air Conditioning', description: 'Cool AC in every room' },
        { locale: 'bn', name: 'এসি', description: 'প্রতিটি কক্ষে ঠাণ্ডা এসি' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 4,
      status: true,
      translations: [
        { locale: 'en', name: 'TV', description: 'Flat-screen smart TV with streaming' },
        { locale: 'bn', name: 'টিভি', description: 'স্ট্রিমিং সহ ফ্ল্যাট-স্ক্রিন স্মার্ট টিভি' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 5,
      status: true,
      translations: [
        { locale: 'en', name: 'Kitchen', description: 'Fully equipped kitchen' },
        { locale: 'bn', name: 'রান্নাঘর', description: 'সম্পূর্ণ সজ্জিত রান্নাঘর' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 6,
      status: true,
      translations: [
        { locale: 'en', name: 'Washer', description: 'Washing machine available' },
        { locale: 'bn', name: 'ওয়াশিং মেশিন', description: 'কাপড় ধোয়ার মেশিন উপলব্ধ' },
      ],
    },
  ];

  const safetyAmenitiesData = [
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 1,
      status: true,
      translations: [
        { locale: 'en', name: 'Fire Extinguisher', description: 'Fire Extinguisher' },
        { locale: 'bn', name: 'অগ্নি নির্বাপক যন্ত্র', description: 'অগ্নি নির্বাপক যন্ত্র' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 2,
      status: true,
      translations: [
        { locale: 'en', name: 'First Aid Kit', description: 'First Aid Kit' },
        { locale: 'bn', name: 'ফার্স্ট এইড কিট', description: 'ফার্স্ট এইড কিট' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 3,
      status: true,
      translations: [
        { locale: 'en', name: 'Smoke Detector', description: 'Alerts you in case of smoke' },
        { locale: 'bn', name: 'ধোঁয়া সনাক্তকারী', description: 'ধোঁয়া হলে সতর্ক করে' },
      ],
    },
    {
      icon: '/images/placeholders/placeholder.jpg',
      order: 4,
      status: true,
      translations: [
        { locale: 'en', name: 'Security Cameras', description: '24/7 security surveillance' },
        { locale: 'bn', name: 'সিকিউরিটি ক্যামেরা', description: '২৪/৭ নিরাপত্তা নজরদারি' },
      ],
    },
  ];

  // Seed common amenities
  for (const amenity of commonAmenitiesData) {
    const createdAmenity = await prisma.amenities.create({
      data: {
        icon: amenity.icon,
        order: amenity.order,
        status: amenity.status,
        amenitiesTypeId: commonType.id,
        amenitiesTranslation: {
          create: amenity.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
      },
    });
  }

  // Seed safety amenities
  for (const amenity of safetyAmenitiesData) {
    const createdAmenity = await prisma.amenities.create({
      data: {
        icon: amenity.icon,
        order: amenity.order,
        status: amenity.status,
        amenitiesTypeId: safetyType.id,
        amenitiesTranslation: {
          create: amenity.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
      },
    });
  }

  console.log('✅ Seed completed:Amenities Type And Amenities.');
}
