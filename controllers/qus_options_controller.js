import db from '../models/index.js';
const QuestionOptions = db.QuestionOptions;

// Create single or multiple options for a question
export const createQuestionOptions = async (req, res) => {
  try {
    const { questionId } = req.params;
    let optionsData = req.body;

    // If options sent as JSON string, parse it
    if (typeof optionsData.options === 'string') {
      optionsData = JSON.parse(optionsData.options);
    }

    // Always treat as array for bulkCreate
    const optionsArray = Array.isArray(optionsData) ? optionsData : [optionsData];

    const optionsToCreate = optionsArray.map(opt => ({
      ...opt,
      question_id: questionId,
    }));

    const createdOptions = await QuestionOptions.bulkCreate(optionsToCreate);

    return res.status(201).json({
      data: createdOptions,
      success: true,
      message: 'Question options created successfully',
    });
  } catch (error) {
    console.error('Error in createQuestionOptions:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all options by question id
export const getQuestionOptionsByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const options = await QuestionOptions.findAll({ where: { question_id: questionId } });
    return res.status(200).json({
      data: options,
      success: true,
      message: 'Question options fetched successfully',
    });
  } catch (error) {
    console.error('Error in getQuestionOptionsByQuestion:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get option by id
export const getQuestionOptionById = async (req, res) => {
  try {
    const { optionId } = req.params;
    const option = await QuestionOptions.findByPk(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Question option not found', success: false });
    }
    return res.status(200).json({
      data: option,
      success: true,
      message: 'Question option fetched successfully',
    });
  } catch (error) {
    console.error('Error in getQuestionOptionById:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update option by id
export const updateQuestionOption = async (req, res) => {
  try {
    const { optionId } = req.params;
    const updatedData = { ...req.body };
    const [updated] = await QuestionOptions.update(updatedData, { where: { id: optionId } });
    if (!updated) {
      return res.status(404).json({ message: 'Question option not found', success: false });
    }
    const updatedOption = await QuestionOptions.findByPk(optionId);
    return res.status(200).json({
      data: updatedOption,
      success: true,
      message: 'Question option updated successfully',
    });
  } catch (error) {
    console.error('Error in updateQuestionOption:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete option by id
export const deleteQuestionOption = async (req, res) => {
  try {
    const { optionId } = req.params;
    const deleted = await QuestionOptions.destroy({ where: { id: optionId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Question option not found', success: false });
    }
    return res.status(200).json({
      message: 'Question option deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error in deleteQuestionOption:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
