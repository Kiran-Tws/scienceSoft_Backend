import db from '../models/index.js';
const Subcategories = db.Subcategories;
const Categories = db.Categories;

// Create multiple subcategories with multiple icon uploads
export const createSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

     // Verify category exists
    const categoryExists = await Categories.findByPk(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found', success: false });
    }

    const subCategoriesData =
      typeof req.body.subCategories === 'string'
        ? JSON.parse(req.body.subCategories)
        : req.body.subCategories;

    if (!Array.isArray(subCategoriesData)) {
      throw new Error('Subcategories data must be an array');
    }

    // if (!req.files || req.files.length !== subCategoriesData.length) {
    //   throw new Error('Number of images does not match subcategories count');
    // }
    const iconsArr = req.files || [];
    const subCategoriesToCreate = subCategoriesData.map((subCat, index) => ({
      ...subCat,
      category_id: categoryId,
      icon: iconsArr[index] ? iconsArr[index].filename : null,
    }));

    const createdSubCategories = await Subcategories.bulkCreate(subCategoriesToCreate);

    return res.status(201).json({
      data: createdSubCategories,
      success: true,
      message: 'Subcategories with images created successfully',
    });
  } catch (error) {
    console.error('Error in createSubCategories:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all subcategories by category id
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await Subcategories.findAll({ where: { category_id: categoryId } });
    return res.status(200).json({ data: subCategories, success: true, message: 'Subcategories fetched successfully' });
  } catch (error) {
    console.error('Error in getSubCategoriesByCategory:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get a subcategory by its unique id
export const getSubCategoryById = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const subCategory = await Subcategories.findByPk(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found', success: false });
    }
    return res.status(200).json({ data: subCategory, success: true, message: 'Subcategory fetched successfully' });
  } catch (error) {
    console.error('Error in getSubCategoryById:', error);
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
    const [updated] = await Subcategories.update(updatedData, { where: { id: subCategoryId } });
    if (!updated) {
      return res.status(404).json({ message: 'Subcategory not found', success: false });
    }
    const updatedSubCategory = await Subcategories.findByPk(subCategoryId);
    return res.status(200).json({ data: updatedSubCategory, success: true, message: 'Subcategory updated successfully' });
  } catch (error) {
    console.error('Error in updateSubCategory:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete subcategory by id
export const deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const deleted = await Subcategories.destroy({ where: { id: subCategoryId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Subcategory not found', success: false });
    }
    return res.status(200).json({ message: 'Subcategory deleted successfully', success: true });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
