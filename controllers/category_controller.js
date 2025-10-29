import db from "../models/index.js";
const Categories = db.Categories;
import { Op } from "sequelize";

export const createCategories = async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log("serviceId ->>", serviceId);

    let categoriesData =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    console.log("categoriesData ->>", categoriesData);

    // Convert single object into array
    if (!Array.isArray(categoriesData)) {
      categoriesData = [categoriesData];
    }
    console.log("categoriesData ->>", categoriesData);

    // Check duplicates inside request
    const namesInRequest = categoriesData.map((cat) =>
      cat.name.toLowerCase().trim()
    );
    console.log("namesInRequest ->>", namesInRequest);

    const duplicateNamesInRequest = namesInRequest.filter(
      (name, idx) => namesInRequest.indexOf(name) !== idx
    );
    if (duplicateNamesInRequest.length > 0) {
      return res.status(400).json({
        message:
          "Duplicate category names found in the request: " +
          [...new Set(duplicateNamesInRequest)].join(", "),
        success: false,
      });
    }

    // Check duplicates in DB for the same service
    const existingCategories = await Categories.findAll({
      where: {
        service_id: serviceId,
        name: categoriesData.map((cat) => cat.name.trim()),
      },
      attributes: ["name"],
      raw: true,
    });

    if (existingCategories.length > 0) {
      const existingNames = existingCategories.map((c) => c.name.toLowerCase());
      const duplicates = categoriesData
        .map((c) => c.name.toLowerCase())
        .filter((name) => existingNames.includes(name));
      return res.status(400).json({
        message:
          "Category names already exist: " +
          [...new Set(duplicates)].join(", "),
        success: false,
      });
    }

    const iconsArr = req.files || [];
    const categoriesToCreate = categoriesData.map((cat, index) => ({
      ...cat,
      service_id: serviceId,
      icon: iconsArr[index] ? iconsArr[index].filename : null,
    }));

    const createdCategories = await Categories.bulkCreate(categoriesToCreate);

    return res.status(201).json({
      data: createdCategories,
      success: true,
      message: "Categories with images created successfully",
    });
  } catch (error) {
    console.error("Error in createCategories:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getCategoriesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const categories = await Categories.findAll({
      where: { service_id: serviceId },
    });
    return res.status(200).json({
      data: categories,
      success: true,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    console.log("Error in getCategoriesByService:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Categories.findByPk(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }
    return res.status(200).json({
      data: category,
      success: true,
      message: "Category fetched successfully",
    });
  } catch (error) {
    console.log("Error in getCategoryById API:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedData = { ...req.body };
    if (req.file) {
      updatedData.icon = req.file.filename;
    }

    // Fetch existing category to get related service_id
    const existingCategory = await Categories.findByPk(categoryId);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    // Validate duplicate name if name is updated
    if (updatedData.name && updatedData.name.trim() !== existingCategory.name) {
      const duplicate = await Categories.findOne({
        where: {
          service_id: existingCategory.service_id,
          name: updatedData.name.trim(),
          id: { [Op.ne]: categoryId },
        },
      });
      if (duplicate) {
        return res.status(400).json({
          message: "Category name already exists in this service",
          success: false,
        });
      }
    }

    const [updated] = await Categories.update(updatedData, {
      where: { id: categoryId },
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    const updatedCategory = await Categories.findByPk(categoryId);

    return res.status(200).json({
      data: updatedCategory,
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deleted = await Categories.destroy({
      where: { id: categoryId },
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }
    return res.status(200).json({
      message: "Category deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error in deleteCategory API:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
