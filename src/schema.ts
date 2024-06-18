// src/schema.ts
import { gql } from "apollo-server-express";

const typeDefs = gql`
  type RandomDie {
    rollOnce: Int!
    roll(numRolls: Int!): [Int!]!
  }

  type Hello {
    sayHello: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!,
    password: String!,
    createdAt: String!,
    updatedAt: String!,
    isEnable: Boolean!
  }

  type Category{
    id: ID!
    name: String!
    userId: Int!
    createdAt: String!
    updatedAt: String!
    type: String
    data: String
    appliedPreset: String
  }

  type Item{
    id: ID!
    title: String!
    catId: Int!
    content: String
    belongTo: String
    check: Boolean
  }

  type Preset{
    id: ID!
    name: String!
    userId: Int!
    content: String
  }

  type Schedule{
    id: ID!
    name: String!
    userId: Int!
    content: String
    targetDate: Float!
  }

  type ScheduleReturn{
    id: ID!
    name: String!
    userId: Int!
    content: String
    targetDate: String!
  }

  type Scrap{
    id: ID!
    userId: Int!
    content: String
  }

  type UserService {
    getUserInfo: [User!]!
    getUserById(userId: Int!): User!
  }

  type CategoryService {
    getCategoriesByUser: [Category!]!
  }

  type ItemService {
    getItemByCat(catId: Int!): [Item!]!
  }

  type PresetService {
    getPresets: [Preset!]!
  }

  type ScheduleService {
    getSchedules: [ScheduleReturn!]!
  }

  type ScrapService {
    getScraps: [Scrap!]!
  }

  type Query {
    getDie(numSides: Int): RandomDie!
    getHello: Hello!
    getUsers: UserService!
    getCategories: CategoryService!
    getItems: ItemService!
    getPresets: PresetService!
    getSchedules: ScheduleService!
    getScraps: ScrapService!
  }

  type AuthMutations {
    login(name: String!, password: String!): AuthPayload
    signup(name: String!, password: String!): AuthPayload
  }

  type CatMutations {
    createCategory(name: String!, type: String, data: String, appliedPreset: String): Category!
    editCategory(id: Int!, name: String, type: String, data: String, appliedPreset: String): Category!,
    updateCategoryPreset(id: Int!, appliedPreset: String): Category!,
    deleteCategory(id: Int!): Boolean!
    deleteMultiCategory(ids: [Int!]!): Boolean!
  }

  type ItemMutations {
    createItem(title: String!, catId: Int!, content: String, belongTo: String, check: Boolean): Item!
    editItem(id: Int!, title: String!, catId: Int!, content: String, belongTo: String, check: Boolean): Item!
    updateItemCheck(id: Int!, check: Boolean!): Item!
    updateItemBelongTo(id: Int!, belongTo: String!): Item!
    updateItemContent(id: Int!, content: String!): Item!
    deleteItem(id: Int!): Boolean!
    deleteMultipleItems(ids: [Int!]!): Boolean!
  }

  type PresetMutations {
    createPreset(name: String!, content: String): Preset!
    editPreset(id:Int!, name: String!, content: String): Preset!
    deletePreset(id: Int!): Boolean!
    deleteMultiPreset(ids: [Int!]!): Boolean!
  }

  type ScheduleMutations {
    createSchedule(name: String!, content: String, targetDate: String): ScheduleReturn!
    editSchedule(id: Int!, name: String!, content: String, targetDate: String): ScheduleReturn!
    deleteSchedule(id: Int!): Boolean!
    deleteMultiSchedule(ids: [Int!]!): Boolean!
  }

  type ScrapMutations {
    createScrap(content: String): Scrap!
    editScrap(id:Int!, content: String): Scrap!
    deleteScrap(id: Int!): Boolean!
    deleteMultiScrap(ids: [Int!]!): Boolean!
  }

  type Mutation {
    authMutation: AuthMutations,
    catMutation: CatMutations,
    itemMutation: ItemMutations,
    presetMutation: PresetMutations
    scheduleMutation: ScheduleMutations
    scrapMutation: ScrapMutations
  }
`;

export default typeDefs;
