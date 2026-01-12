export async function CancellationPolicySeed(prisma) {
  // Seed cancellation policies with translations
  const policies = [
    {
      beforeDays: 7,
      beforeDayPriorRefund: 100.0,
      afterDayPriorRefund: 50.0,
      cancellationPolicyTranslation: {
        create: [
          {
            locale: 'en',
            name: 'Flexible',
            description: 'Full refund up to 7 days before check-in, 50% refund afterwards.',
          },
          {
            locale: 'bn',
            name: 'নমনীয়',
            description: 'চেক-ইনের ৭ দিন আগ পর্যন্ত সম্পূর্ণ টাকা ফেরত, পরে ৫০% ফেরত।',
          },
        ],
      },
    },
    {
      beforeDays: 14,
      beforeDayPriorRefund: 90.0,
      afterDayPriorRefund: 0.0,
      cancellationPolicyTranslation: {
        create: [
          {
            locale: 'en',
            name: 'Moderate',
            description: '90% refund up to 14 days before check-in, no refund afterwards.',
          },
          {
            locale: 'bn',
            name: 'মডারেট',
            description: 'চেক-ইনের ১৪ দিন আগ পর্যন্ত ৯০% টাকা ফেরত, পরে টাকা ফেরত নেই।',
          },
        ],
      },
    },
  ];

  for (const policy of policies) {
    await prisma.cancellationPolicy.create({
      data: policy,
    });
  }
  console.log('✅ Seed completed: Cancellation policies.');
}
