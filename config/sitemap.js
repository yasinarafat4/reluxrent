// sitemap.js
const prisma = require('./prisma');

const getUrls = async () => {
  const pages = await prisma.page.findMany({
    where: { status: true },
    select: { slug: true, updatedAt: true },
  });

  const pagesUrls = pages.map((page) => ({
    url: page.slug == 'home' ? '/' : `/${page.slug}`,
    lastMod: page.updatedAt,
    changeFreq: 'weekly',
    priority: 0.6,
  }));

  console.log('Generating sitemap...');
  return [...pagesUrls];
};

module.exports = getUrls;
