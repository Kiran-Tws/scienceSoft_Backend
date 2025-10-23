import db from "../models/index.js";
const Categories = db.Categories;

export const createCategories = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const categoriesData =
      typeof req.body.categories === "string"
        ? JSON.parse(req.body.categories)
        : req.body.categories;

    if (!Array.isArray(categoriesData)) {
      throw new Error("Categories data must be an array");
    }

    // if (!req.files || req.files.length !== categoriesData.length) {
    //   throw new Error("Number of images does not match categories count");
    // }

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
    console.log("Error in createCategories:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
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
    console.log("Error in updateCategory:", error);
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
