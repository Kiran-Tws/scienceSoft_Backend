import db from "../models/index.js";
const Subcategories = db.Subcategories;
const Categories = db.Categories;
import { Op } from "sequelize";

// Create multiple subcategories with multiple icon uploads
export const createSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Verify category exists
    const categoryExists = await Categories.findByPk(categoryId);
    if (!categoryExists) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    let subCategoriesData =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    if (!Array.isArray(subCategoriesData)) {
     subCategoriesData = [subCategoriesData];
    }

    const iconsArr = req.files || [];

    // Check for duplicate names within the request payload itself
    const namesInRequest = subCategoriesData.map((sc) =>
      sc.name.toLowerCase().trim()
    );
    const duplicateNamesInRequest = namesInRequest.filter(
      (name, idx) => namesInRequest.indexOf(name) !== idx
    );
    if (duplicateNamesInRequest.length > 0) {
      return res.status(400).json({
        message:
          "Duplicate subcategory names found in the request: " +
          [...new Set(duplicateNamesInRequest)].join(", "),
        success: false,
      });
    }

    // Check for existing subcategories with same name in the DB under the same category
    const existingSubcategories = await Subcategories.findAll({
      where: {
        category_id: categoryId,
        name: subCategoriesData.map((sc) => sc.name.trim()),
      },
      attributes: ["name"],
      raw: true,
    });

    if (existingSubcategories.length > 0) {
      const existingNames = existingSubcategories.map((sc) =>
        sc.name.toLowerCase()
      );
      const duplicates = subCategoriesData
        .map((sc) => sc.name.toLowerCase())
        .filter((name) => existingNames.includes(name));
      return res.status(400).json({
        message:
          "Subcategory names already exist: " +
          [...new Set(duplicates)].join(", "),
        success: false,
      });
    }

    const subCategoriesToCreate = subCategoriesData.map((subCat, index) => ({
      ...subCat,
      category_id: categoryId,
      icon: iconsArr[index] ? iconsArr[index].filename : null,
    }));

    const createdSubCategories = await Subcategories.bulkCreate(
      subCategoriesToCreate
    );

    return res.status(201).json({
      data: createdSubCategories,
      success: true,
      message: "Subcategories with images created successfully",
    });
  } catch (error) {
    console.error("Error in createSubCategories:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all subcategories by category id
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await Subcategories.findAll({
      where: { category_id: categoryId },
    });
    return res
      .status(200)
      .json({
        data: subCategories,
        success: true,
        message: "Subcategories fetched successfully",
      });
  } catch (error) {
    console.error("Error in getSubCategoriesByCategory:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get a subcategory by its unique id
export const getSubCategoryById = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const subCategory = await Subcategories.findByPk(subCategoryId);
    if (!subCategory) {
      return res
        .status(404)
        .json({ message: "Subcategory not found", success: false });
    }
    return res
      .status(200)
      .json({
        data: subCategory,
        success: true,
        message: "Subcategory fetched successfully",
      });
  } catch (error) {
    console.error("Error in getSubCategoryById:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update a subcategory by id, optional icon upload
export const updateSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.icon = req.file.filename;
    }

    // Fetch existing subcategory to identify its category
    const existingSubCategory = await Subcategories.findByPk(subCategoryId);
    if (!existingSubCategory) {
      return res
        .status(404)
        .json({ message: "Subcategory not found", success: false });
    }

    // If updating the name, check for duplicates in the same category excluding current subcategory
    if (
      updatedData.name &&
      updatedData.name.trim() !== existingSubCategory.name
    ) {
      const duplicate = await Subcategories.findOne({
        where: {
          category_id: existingSubCategory.category_id,
          name: updatedData.name.trim(),
          id: { [Op.ne]: subCategoryId },
        },
      });
      if (duplicate) {
        return res.status(400).json({
          message: "Subcategory name already exists in this category",
          success: false,
        });
      }
    }

    const [updated] = await Subcategories.update(updatedData, {
      where: { id: subCategoryId },
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Subcategory not found", success: false });
    }

    const updatedSubCategory = await Subcategories.findByPk(subCategoryId);

    return res.status(200).json({
      data: updatedSubCategory,
      success: true,
      message: "Subcategory updated successfully",
    });
  } catch (error) {
    console.error("Error in updateSubCategory:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete subcategory by id
export const deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const deleted = await Subcategories.destroy({
      where: { id: subCategoryId },
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Subcategory not found", success: false });
    }
    return res
      .status(200)
      .json({ message: "Subcategory deleted successfully", success: true });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
