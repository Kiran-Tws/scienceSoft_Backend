import db from "../models/index.js";
const FormSteps = db.FormSteps;
const Subcategories = db.Subcategories;
const QuestionOptions = db.QuestionOptions;
const Questions = db.Questions;

// Create single or multiple form steps for a subcategory
export const createFormSteps = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    console.log("subCategoryId->>", subCategoryId);

    const subCategoryExists = await Subcategories.findByPk(subCategoryId);
    if (!subCategoryExists) {
      return res.status(404).json({ message: "Sub Category not found", success: false });
    }

    let formStepsData = req.body;
    console.log("formStepsData ->>", formStepsData);

    // If body contains 'formSteps' as JSON string, parse it
    if (typeof formStepsData.formSteps === "string") {
      formStepsData = JSON.parse(formStepsData.formSteps);
    }

    // Always expect an array - wrap single object in an array
    const stepsArray = Array.isArray(formStepsData.formSteps)
      ? formStepsData.formSteps
      : [formStepsData.formSteps];
    console.log("stepsArray ->>", stepsArray);

    // Get current max step_order for this subcategory
    const maxStep = await FormSteps.max('step_order', {
      where: { subcategory_id: subCategoryId },
    });
    let startOrder = (maxStep || 0) + 1;

    // Validate each step data if required (e.g., title present)
    for (const step of stepsArray) {
      if (!step.title || typeof step.title !== 'string' || step.title.trim() === '') {
        return res.status(400).json({ message: "Each form step must have a valid title", success: false });
      }
      // Add other validations as needed (e.g., description length, etc.)
    }

    // Assign step_order automatically and attach subcategory_id
    const stepsToCreate = stepsArray.map((step, idx) => ({
      ...step,
      subcategory_id: subCategoryId,
      step_order: startOrder + idx,
    }));

    console.log("stepsToCreate ->>", stepsToCreate);

    // Bulk create within transaction for integrity
    const createdSteps = await FormSteps.sequelize.transaction(async (t) => {
      return await FormSteps.bulkCreate(stepsToCreate, { transaction: t });
    });

    console.log("createdSteps ->>", createdSteps);

    return res.status(201).json({
      data: createdSteps,
      success: true,
      message: "Form steps created successfully",
    });
  } catch (error) {
    console.error("Error in createFormSteps:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};


// Get all form steps for a subcategory
export const getFormStepsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const formSteps = await FormSteps.findAll({
      where: { subcategory_id: subCategoryId },
      order: [["step_order", "ASC"]],
    });
    return res.status(200).json({
      data: formSteps,
      success: true,
      message: "Form steps fetched successfully",
    });
  } catch (error) {
    console.error("Error in getFormStepsBySubCategory:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get single form step by id
export const getFormStepById = async (req, res) => {
  try {
    const { formStepId } = req.params;
    const formStep = await FormSteps.findByPk(formStepId);
    if (!formStep) {
      return res
        .status(404)
        .json({ message: "Form step not found", success: false });
    }
    return res.status(200).json({
      data: formStep,
      success: true,
      message: "Form step fetched successfully",
    });
  } catch (error) {
    console.error("Error in getFormStepById:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update form step by id
export const updateFormStep = async (req, res) => {
  try {
    const { formStepId } = req.params;
    // Remove step_order if present in the incoming data to prevent update
    const updatedData = { ...req.body };
    if ('step_order' in updatedData) {
      delete updatedData.step_order;
    }

    // Optionally validate other fields, e.g., title must be non-empty string if provided
    if (updatedData.title !== undefined) {
      if (typeof updatedData.title !== 'string' || updatedData.title.trim() === '') {
        return res.status(400).json({
          message: 'Title must be a non-empty string if provided',
          success: false,
        });
      }
    }

    const [updated] = await FormSteps.update(updatedData, {
      where: { id: formStepId },
    });

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
      return res
        .status(404)
        .json({ message: "Form step not found", success: false });
    }
    return res.status(200).json({
      message: "Form step deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in deleteFormStep:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getFormStepDetails = async (req, res) => {
  try {
    const { formStepId } = req.params;

    // Fetch the form step by ID with its related data
    const formStep = await FormSteps.findOne({
      where: { id: formStepId },
      attributes: ['id', 'step_order', 'title', 'description'],
      include: [
        {
          model: Questions,
          as: 'questions',  // assume you defined Questions hasMany FormSteps association with this alias
          attributes: ['id', 'question_text', 'input_type', 'allow_other', 'is_required'],
          include: [
            {
              model: QuestionOptions,
              as: 'options',  // assume you defined QuestionOptions belongsTo Questions association with this alias
              attributes: ['id', 'option_label', 'option_value', 'is_other'],
            },
          ],
          order: [['question_text', 'ASC']], // ordering questions by text, can adjust if needed
        },
      ],
    });

    if (!formStep) {
      return res.status(404).json({
        success: false,
        message: 'Form step not found',
      });
    }

    // Format response data simply
    return res.status(200).json({
      success: true,
      message: 'Form step details fetched successfully',
      data: {
        id: formStep.id,
        order: formStep.step_order,
        title: formStep.title,
        description: formStep.description,
        questions: formStep.questions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          input_type: q.input_type,
          allow_other: q.allow_other,
          is_required: q.is_required,
          options: q.options.map(opt => ({
            id: opt.id,
            label: opt.option_label,
            value: opt.option_value,
            is_other: opt.is_other,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching form step details:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

