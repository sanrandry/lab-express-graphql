const {GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLSchema, GraphQLEnumType} = require('graphql');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const projectStatusEnum = new GraphQLEnumType({
      name: 'ProjectStatus',
      values: {
        TODO: { value: 'TODO' },
        IN_PROGRESS: { value: 'IN_PROGRESS' },
        DONE: { value: 'DONE' }
      }
    });
const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: projectStatusEnum },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve: async (parent, args, context) => {
        return await prisma.client.findUnique({
          where: { id: parent.clientId }
        });
      }
    }
  })
});
const ProjectInputType = new GraphQLInputObjectType({
  name: 'ProjectInput',
  fields: () => ({
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: projectStatusEnum }
  })
});

const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve: async (parent, args, context) => {
        return await prisma.project.findMany({
          where: { clientId: parent.id }
        });
      }
    }
  })
});

const ClientInput = new GraphQLInputObjectType({
  name: "ClientInput",
  fields: () => ({
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    clients: {
      type: new GraphQLList(ClientType),
      resolve(parent, args) {
        return prisma.client.findMany();
      }
    },
    client: {
      type: ClientType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve(parent, args) {
        return prisma.client.findUnique({
          where: {
            id: args.id
          }
        });
      }
    },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve(parent, args) {
        return prisma.project.findMany();
      }
    },
    project: {
      type: ProjectType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve(parent, args) {
        return prisma.project.findUnique({
          where: {
            id: args.id
          }
        });
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Client mutations
    createClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return prisma.client.create({
          data: {
            name: args.name,
            email: args.email,
            phone: args.phone,
          },
        });
      },
    },
    updateClient: {
      type: ClientType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        client: { type: GraphQLNonNull(ClientInput) },
      },
      resolve(parent, args) {
        return prisma.client.update({
          where: {
            id: args.id,
          },
          data: {
            ...args.client,
          },
        });
      },
    },
    deleteClient: {
      type: ClientType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        return prisma.client.delete({
          where: {
            id: args.id,
          },
        });
      },
    },
    // Project mutations
    createProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLNonNull(projectStatusEnum) },
        clientId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        return prisma.project.create({
          data: {
            ...args,
          },
        });
      },
    },
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        project: { type: GraphQLNonNull(ProjectInputType) },
      },
      resolve(parent, args) {
        return prisma.project.update({
          where: {
            id: args.id,
          },
          data: {
            ...args.project,
          },
        });
      }
    },
    deleteProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        return prisma.project.delete({
          where: {
            id: args.id,
          },
        });
      }
    }
  },
});


module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});