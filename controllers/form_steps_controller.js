import db from '../models/index.js';
const FormSteps = db.FormSteps;

// Create single or multiple form steps for a subcategory
export const createFormSteps = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    let formStepsData = req.body;

    // If body contains 'formSteps' as JSON string, parse it
    if (typeof formStepsData.formSteps === 'string') {
      formStepsData = JSON.parse(formStepsData.formSteps);
    }

    // Always expect an array - wrap single object in an array
    const stepsArray = Array.isArray(formStepsData) ? formStepsData : [formStepsData];

    const stepsToCreate = stepsArray.map(step => ({
      ...step,
      subcategory_id: subCategoryId,
    }));

    const createdSteps = await FormSteps.bulkCreate(stepsToCreate);

    return res.status(201).json({
      data: createdSteps,
      success: true,
      message: 'Form steps created successfully',
    });
  } catch (error) {
    console.error('Error in createFormSteps:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};


// Get all form steps for a subcategory
export const getFormStepsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const formSteps = await FormSteps.findAll({
      where: { subcategory_id: subCategoryId },
      order: [['step_order', 'ASC']],
    });
    return res.status(200).json({
      data: formSteps,
      success: true,
      message: 'Form steps fetched successfully',
    });
  } catch (error) {
    console.error('Error in getFormStepsBySubCategory:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get single form step by id
export const getFormStepById = async (req, res) => {
  try {
    const { formStepId } = req.params;
    const formStep = await FormSteps.findByPk(formStepId);
    if (!formStep) {
      return res.status(404).json({ message: 'Form step not found', success: false });
    }
    return res.status(200).json({
      data: formStep,
      success: true,
      message: 'Form step fetched successfully',
    });
  } catch (error) {
    console.error('Error in getFormStepById:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update form step by id
export const updateFormStep = async (req, res) => {
  try {
    const { formStepId } = req.params;
    const updatedData = { ...req.body };
    const [updated] = await FormSteps.update(updatedData, { where: { id: formStepId } });
    if (!updated) {
      return res.status(404).json({ message: 'Form step not found', success: false });
    }
    const updatedFormStep = await FormSteps.findByPk(formStepId);
    return res.status(200).json({
      data: updatedFormStep,
      success: true,
      message: 'Form step updated successfully',
    });
  } catch (error) {
    console.error('Error in updateFormStep:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete form step by id
export const deleteFormStep = async (req, res) => {
  try {
    const { formStepId } = req.params;
    const deleted = await FormSteps.destroy({ where: { id: formStepId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Form step not found', success: false });
    }
    return res.status(200).json({
      message: 'Form step deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error in deleteFormStep:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
