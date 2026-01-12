const { PrismaClient } = require('@prisma/client');

const softDeleteModels = ['User', 'Property', 'Booking'];

const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (softDeleteModels.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (softDeleteModels.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findUnique({ model, args, query }) {
        if (softDeleteModels.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async delete({ model, args, query }) {
        if (softDeleteModels.includes(model)) {
          return prisma[model].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
      async deleteMany({ model, args, query }) {
        if (softDeleteModels.includes(model)) {
          return prisma[model].updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
    },
  },
});

module.exports = prisma;
