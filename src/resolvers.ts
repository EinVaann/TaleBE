import User from "./models/users"; // Adjust the import based on your actual User model import
import Category from "./models/categories";
import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import Item from "./models/items";
import Preset from "./models/preset";
import Scrap from "./models/scrap";
import Schedule from "./models/schedule";

const jwtSecret = "random_secret_key";

// Define types for your resolver arguments and parent types
interface IRandomDice {
  numSides: number;
}

interface AuthBody {
  userId: number;
}

const withAuth = (resolver: any) => {
  return (_parent: any, args: any, context: any) => {
    if (!context.user) {
      throw new AuthenticationError("You must be logged in to do this");
    }
    return resolver(_parent, args, context);
  };
};

// Define your resolver functions
const resolvers = {
  RandomDie: {
    rollOnce: (parent: IRandomDice) => {
      return 1 + Math.floor(Math.random() * parent.numSides);
    },
    roll: (parent: IRandomDice, { numRolls }: { numRolls: number }) => {
      const output = [];
      for (let i = 0; i < numRolls; i++) {
        output.push(1 + Math.floor(Math.random() * parent.numSides));
      }
      return output;
    },
  },
  Hello: {
    sayHello: () => {
      return "hello";
    },
  },
  UserService: {
    getUserInfo: async () => {
      try {
        const users = await User.findAll(); // Adjust based on your User model methods
        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Error fetching users");
      }
    },
    getUserById: async (_parent: any, { userId }: { userId: number }) => {
      try {
        const user = await User.findByPk(userId); // Adjust based on your User model methods
        return user;
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Error fetching user");
      }
    },
  },
  CategoryService: {
    getCategoriesByUser: async (parent: AuthBody) => {
      try {
        console.log(parent);
        const categories = await Category.findAll({
          where: { userId: parent.userId },
        });
        return categories;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Error fetching categories");
      }
    },
  },
  ItemService: {
    getItemByCat: async (parent: AuthBody, { catId }: { catId: number }) => {
      try {
        const category = await Category.findOne({
          where: { id: catId, userId: parent.userId },
        });
        if (!category) {
          console.error("Category dont exist");
          throw new Error("Error no category");
        }
        const items = await Item.findAll({ where: { catId: catId } });
        return items;
      } catch (error) {
        console.error("Error fetching items:", error);
        throw new Error("Error fetching items");
      }
    },
  },
  PresetService: {
    getPresets: async (parent: AuthBody) => {
      try {
        const preset = await Preset.findAll({
          where: { userId: parent.userId },
        });
        return preset;
      } catch (error) {
        console.error("Error fetching preset:", error);
        throw new Error("Error fetching preset");
      }
    },
  },
  ScheduleService: {
    getSchedules: async (parent: AuthBody) => {
      try {
        const schedule = await Schedule.findAll({
          where: { userId: parent.userId },
        });
        return schedule.map((sche) => ({
          id: sche.id,
          name: sche.name,
          userId: sche.userId,
          content: sche.content,
          targetDate: sche.targetDateFormatted,
        }));
      } catch (error) {
        console.error("Error fetching schedule:", error);
        throw new Error("Error fetching Schedule");
      }
    },
  },
  ScrapService: {
    getScraps: async (parent: AuthBody) => {
      try {
        const scrap = await Scrap.findAll({
          where: { userId: parent.userId },
        });
        return scrap;
      } catch (error) {
        console.error("Error fetching scrap:", error);
        throw new Error("Error fetching scrap");
      }
    },
  },
  Query: {
    getDie: (_parent: IRandomDice, { numSides }: IRandomDice) => {
      return { numSides: numSides || 6 };
    },
    getHello: () => {
      return {};
    },
    getUsers: withAuth((_parent: any, _args: any, context: any) => {
      return {}; // Return users based on your logic
    }),
    getCategories: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id }; // Return categories based on your logic
    }),
    getItems: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id }; // Return items based on your logic
    }),
    getPresets: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id }; // Return presets based on your logic
    }),
    getSchedules: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id }; // Return presets based on your logic
    }),
    getScraps: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id }; // Return scraps based on your logic
    }),
  },
  AuthMutations: {
    login: async (
      _parent: any,
      { name, password }: { name: string; password: string }
    ) => {
      const user = await User.findOne({ where: { name } });
      if (!user || !(await user.checkPassword(password)) || !user.isEnable) {
        throw new UserInputError("Invalid name or password");
      }
      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "6h" });
      return {
        token,
        user: { id: user.id, name: user.name },
      };
    },
    signup: async (
      _parent: any,
      { name, password }: { name: string; password: string }
    ) => {
      const user = await User.create({ name, password });
      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "6h" });
      return {
        token,
        user: { id: user.id, name: user.name },
      };
    },
  },
  CatMutations: {
    createCategory: async (
      parent: AuthBody,
      {
        name,
        type = "None",
        data = "None",
        appliedPreset = "",
      }: { name: string; type: string; data: string; appliedPreset: string }
    ) => {
      try {
        // Create a new category using Sequelize's create method
        const newCategory = await Category.create({
          name,
          userId: parent.userId, // Assuming parent contains userId
          type,
          data,
          appliedPreset,
        });
        return newCategory; // Return the newly created category object
      } catch (error) {
        console.error("Error creating category:", error);
        throw new Error("Failed to create category");
      }
    },
    editCategory: async (
      parent: AuthBody,
      {
        id,
        name,
        type,
        data,
        appliedPreset,
      }: {
        id: number;
        name?: string;
        type?: string;
        data?: string;
        appliedPreset?: string;
      }
    ) => {
      try {
        // Find the category by id
        const category = await Category.findOne({
          where: { id: id, userId: parent.userId },
        });
        if (!category) {
          throw new Error("Category not found");
        }

        // Update attributes if provided
        await category.update({
          name: name !== undefined ? name : category.name,
          type: type !== undefined ? type : category.type,
          data: data !== undefined ? data : category.data,
          appliedPreset:
            appliedPreset !== undefined
              ? appliedPreset
              : category.appliedPreset,
        });

        // Save the updated category
        await category.save();

        return category; // Return the updated category object
      } catch (error) {
        console.error("Error editing category:", error);
        throw new Error("Failed to edit category");
      }
    },
    updateCategoryPreset: async (
      parent: AuthBody,
      { id, appliedPreset }: { id: number; appliedPreset: string }
    ) => {
      try {
        // Find the category by id
        const category = await Category.findOne({
          where: { id: id, userId: parent.userId },
        });
        if (!category) {
          throw new Error("Category not found");
        }
        await category.update({
          appliedPreset:
            appliedPreset !== undefined
              ? appliedPreset
              : category.appliedPreset,
        });
        await category.save();

        return category; // Return the updated category object
      } catch (error) {
        console.error("Error editing category:", error);
        throw new Error("Failed to edit category");
      }
    },
    deleteCategory: async (parent: AuthBody, { id }: { id: number }) => {
      try {
        const deleteCategory = await Category.findOne({
          where: { id: id, userId: parent.userId },
        });
        if (!deleteCategory) {
          throw new UserInputError("Category not found");
        }
        const itemsToDelete = await Item.findAll({
          where: { catId: id },
        });
        await Promise.all(itemsToDelete.map((item) => item.destroy()));
        await deleteCategory.destroy();

        return true;
      } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Error deleting category");
      }
    },
    deleteMultiCategory: async (
      parent: AuthBody,
      { ids }: { ids: number[] }
    ) => {
      try {
        const deleteCategory = await Category.findAll({
          where: { id: ids, userId: parent.userId },
        });
        if (!deleteCategory) {
          throw new UserInputError("Category not found");
        }
        if (deleteCategory.length !== ids.length) {
          throw new UserInputError("One or more categories not found");
        }
        const itemsToDelete = await Item.findAll({
          where: {
            catId: ids,
          },
        });
        await Promise.all(itemsToDelete.map((item) => item.destroy()));
        await Promise.all(deleteCategory.map((category) => category.destroy()));

        return true;
      } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Error deleting category");
      }
    },
  },
  ItemMutations: {
    createItem: async (
      parent: AuthBody,
      {
        title,
        catId,
        content = "",
        belongTo = "NONE",
        check = false,
      }: {
        title: string;
        catId: number;
        content: string;
        belongTo: string;
        check: boolean;
      }
    ) => {
      try {
        // check category
        const category = await Category.findOne({
          where: { id: catId, userId: parent.userId },
        });
        if (!category) {
          console.error("Category dont exist");
          throw new Error("Error no category");
        }
        const newItem = await Item.create({
          title,
          catId,
          content,
          belongTo,
          check,
        });
        return newItem;
      } catch (error) {
        console.error(error);
        throw new Error("Error creating item");
      }
    },
    editItem: async (
      parent: AuthBody,
      {
        id,
        title,
        catId,
        content = "",
        belongTo = "NONE",
        check = false,
      }: {
        id: number;
        title: string;
        catId: number;
        content: string;
        belongTo: string;
        check: boolean;
      }
    ) => {
      try {
        const item = await Item.findOne({
          where: { id: id },
        });
        if (!item) {
          console.error("Item doesn't exist");
          throw new Error("Error: Item not found");
        }

        // Check if the new category exists if catId is provided
        if (catId !== undefined) {
          const category = await Category.findOne({
            where: { id: catId, userId: parent.userId },
          });
          if (!category) {
            console.error("Category doesn't exist");
            throw new Error("Error: Category not found");
          }
        }

        // Update the item
        await item.update({
          title: title !== undefined ? title : item.title,
          content: content !== undefined ? content : item.content,
          belongTo: belongTo !== undefined ? belongTo : item.belongTo,
          check: check !== undefined ? check : item.check,
        });

        return item;
      } catch (error) {
        console.error(error);
        throw new Error("Error updating item");
      }
    },
    updateItemCheck: async (
      parent: AuthBody,
      {
        id,
        check,
      }: {
        id: number;
        check: boolean;
      }
    ) => {
      try {
        // Check if item exists
        const item = await Item.findOne({
          where: { id: id },
        });
        if (!item) {
          console.error("Item doesn't exist");
          throw new Error("Error: Item not found");
        }

        // Update the check field
        await item.update({ check });

        return item;
      } catch (error) {
        console.error(error);
        throw new Error("Error updating item check field");
      }
    },
    updateItemBelongTo: async (
      parent: AuthBody,
      {
        id,
        belongTo,
      }: {
        id: number;
        belongTo: string;
      }
    ) => {
      try {
        // Check if item exists
        const item = await Item.findOne({
          where: { id: id },
        });
        if (!item) {
          console.error("Item doesn't exist");
          throw new Error("Error: Item not found");
        }

        // Update the belongTo field
        await item.update({ belongTo });

        return item;
      } catch (error) {
        console.error(error);
        throw new Error("Error updating item belongTo field");
      }
    },
    updateItemContent: async (
      parent: AuthBody,
      {
        id,
        content,
      }: {
        id: number;
        content: string;
      }
    ) => {
      try {
        // Check if item exists
        const item = await Item.findOne({
          where: { id: id },
        });
        if (!item) {
          console.error("Item doesn't exist");
          throw new Error("Error: Item not found");
        }

        // Update the belongTo field
        await item.update({ content });

        return item;
      } catch (error) {
        console.error(error);
        throw new Error("Error updating item content field");
      }
    },
    deleteItem: async (parent: AuthBody, { id }: { id: number }) => {
      try {
        const deleteItem = await Item.findByPk(id);
        if (!deleteItem) {
          throw new UserInputError("Item not found");
        }
        const category = await Category.findOne({
          where: { id: deleteItem.catId, userId: parent.userId },
        });
        if (!category) {
          throw new UserInputError("Category not found");
        }
        await deleteItem.destroy();
        return true;
      } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Error deleting category");
      }
    },
    deleteMultipleItems: async (
      parent: AuthBody,
      { ids }: { ids: number[] }
    ) => {
      try {
        const itemsToDelete = await Item.findAll({
          where: {
            id: ids,
          },
        });
        if (itemsToDelete.length !== ids.length) {
          throw new UserInputError("One or more items not found");
        }
        await Promise.all(itemsToDelete.map((item) => item.destroy()));
        return true;
      } catch (error) {
        console.error("Error deleting items:", error);
        throw new Error("Error deleting items");
      }
    },
  },
  PresetMutations: {
    createPreset: async (
      parent: AuthBody,
      { name, content = "" }: { name: string; content: string }
    ) => {
      try {
        // Create a new category using Sequelize's create method
        const newPreset = await Preset.create({
          name,
          userId: parent.userId, // Assuming parent contains userId
          content,
        });
        return newPreset; // Return the newly created category object
      } catch (error) {
        console.error("Error creating preset:", error);
        throw new Error("Failed to create preset");
      }
    },
    editPreset: async (
      parent: AuthBody,
      { id, name, content }: { id: number; name?: string; content?: string }
    ) => {
      try {
        const preset = await Preset.findOne({
          where: { id: id, userId: parent.userId },
        });

        if (!preset) {
          throw new Error("Preset not found");
        }
        await preset.update({
          name: name !== undefined ? name : preset.name,
          content: content !== undefined ? content : preset.content,
        });
        await preset.save();
        return preset;
      } catch (error) {
        console.error("Error editing preset:", error);
        throw new Error("Failed to edit preset");
      }
    },
    deletePreset: async (parent: AuthBody, { id }: { id: number }) => {
      try {
        const deletePreset = await Preset.findOne({
          where: { id: id, userId: parent.userId },
        });
        if (!deletePreset) {
          throw new UserInputError("Preset not found");
        }
        await deletePreset.destroy();

        return true;
      } catch (error) {
        console.error("Error deleting Preset:", error);
        throw new Error("Error deleting Preset");
      }
    },
    deleteMultiPreset: async (parent: AuthBody, { ids }: { ids: number[] }) => {
      try {
        const deletePreset = await Preset.findAll({
          where: { id: ids, userId: parent.userId },
        });
        if (deletePreset.length !== ids.length) {
          throw new UserInputError("One or more preset not found");
        }
        await Promise.all(deletePreset.map((preset) => preset.destroy()));
        return true;
      } catch (error) {
        console.error("Error deleting Preset:", error);
        throw new Error("Error deleting Preset");
      }
    },
  },
  ScheduleMutations: {
    createSchedule: async (
      parent: AuthBody,
      {
        name,
        content = "",
        targetDate,
      }: { name: string; content: string; targetDate: string }
    ) => {
      try {
        // Create a new category using Sequelize's create method
        if(targetDate===undefined){
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          };
          targetDate = new Date().toLocaleDateString(undefined, options);
        }
        console.log(targetDate)
        console.log(new Date(targetDate).getTime())
        const newSchedule = await Schedule.create({
          name,
          userId: parent.userId, // Assuming parent contains userId
          content,
          targetDate: new Date(targetDate).getTime(),
        });
        return {
          id: newSchedule.id,
          name: newSchedule.name,
          userId: newSchedule.userId,
          content: newSchedule.content,
          targetDate: newSchedule.targetDateFormatted,
        }; // Return the newly created category object
      } catch (error) {
        console.error("Error creating Schedule:", error);
        throw new Error("Failed to create Schedule");
      }
    },
    editSchedule: async (
      parent: AuthBody,
      {
        id,
        name,
        content,
        targetDate,
      }: { id: number; name?: string; content?: string; targetDate: string }
    ) => {
      try {
        const schedule = await Schedule.findOne({
          where: { id: id, userId: parent.userId },
        });

        if (!schedule) {
          throw new Error("Preset not found");
        }
        await schedule.update({
          name: name !== undefined ? name : schedule.name,
          content: content !== undefined ? content : schedule.content,
          targetDate:
            targetDate !== undefined
              ? new Date(targetDate).getTime()
              : schedule.targetDate,
        });
        await schedule.save();
        return {
          id: schedule.id,
          name: schedule.name,
          userId: schedule.userId,
          content: schedule.content,
          targetDate: schedule.targetDateFormatted,
        };;
      } catch (error) {
        console.error("Error editing schedule:", error);
        throw new Error("Failed to edit prescheduleset");
      }
    },
    deleteSchedule: async (parent: AuthBody, { id }: { id: number }) => {
      try {
        const deleteSchedule = await Schedule.findOne({
          where: { id: id, userId: parent.userId },
        });
        if (!deleteSchedule) {
          throw new UserInputError("Schedule not found");
        }
        await deleteSchedule.destroy();

        return true;
      } catch (error) {
        console.error("Error deleting Schedule:", error);
        throw new Error("Error deleting Schedule");
      }
    },
    deleteMultiSchedule: async (
      parent: AuthBody,
      { ids }: { ids: number[] }
    ) => {
      try {
        const deleteSchedule = await Schedule.findAll({
          where: { id: ids, userId: parent.userId },
        });
        if (deleteSchedule.length !== ids.length) {
          throw new UserInputError("One or more Schedule not found");
        }
        await Promise.all(deleteSchedule.map((schedule) => schedule.destroy()));
        return true;
      } catch (error) {
        console.error("Error deleting Schedule:", error);
        throw new Error("Error deleting Schedule");
      }
    },
  },
  ScrapMutations: {
    createScrap: async (parent: AuthBody, { content }: { content: string }) => {
      try {
        // Create a new category using Sequelize's create method
        const newScrap = await Scrap.create({
          userId: parent.userId, // Assuming parent contains userId
          content,
        });
        return newScrap; // Return the newly created category object
      } catch (error) {
        console.error("Error creating Scrap:", error);
        throw new Error("Failed to create Scrap");
      }
    },
    editScrap: async (
      parent: AuthBody,
      { id, content }: { id: number; content: string }
    ) => {
      try {
        const scrap = await Scrap.findOne({
          where: { id: id, userId: parent.userId },
        });

        if (!scrap) {
          throw new Error("Preset not found");
        }
        await scrap.update({
          content: content !== undefined ? content : scrap.content,
        });
        await scrap.save();
        return scrap;
      } catch (error) {
        console.error("Error editing Scrap:", error);
        throw new Error("Failed to edit Scrap");
      }
    },
    deleteScrap: async (parent: AuthBody, { id }: { id: number }) => {
      try {
        const deleteScrap = await Scrap.findOne({
          where: { id: id, userId: parent.userId },
        });
        if (!deleteScrap) {
          throw new UserInputError("Scrap not found");
        }
        await deleteScrap.destroy();

        return true;
      } catch (error) {
        console.error("Error deleting Scrap:", error);
        throw new Error("Error deleting Scrap");
      }
    },
    deleteMultiScrap: async (parent: AuthBody, { ids }: { ids: number[] }) => {
      try {
        const deleteScrap = await Scrap.findAll({
          where: { id: ids, userId: parent.userId },
        });
        if (deleteScrap.length !== ids.length) {
          throw new UserInputError("One or more Scrap not found");
        }
        await Promise.all(deleteScrap.map((scrap) => scrap.destroy()));
        return true;
      } catch (error) {
        console.error("Error deleting Scrap:", error);
        throw new Error("Error deleting Scrap");
      }
    },
  },
  Mutation: {
    authMutation: () => {
      return {};
    },
    catMutation: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id };
    }),
    itemMutation: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id };
    }),
    presetMutation: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id };
    }),
    scheduleMutation: withAuth(
      (_parent: AuthBody, _args: any, context: any) => {
        return { userId: context.user.id };
      }
    ),
    scrapMutation: withAuth((_parent: AuthBody, _args: any, context: any) => {
      return { userId: context.user.id };
    }),
  },
};

export default resolvers;
