import db from "../models/index.js";
const QuestionOptions = db.QuestionOptions;
const Questions = db.Questions;
import { Op } from 'sequelize';

// Create single or multiple options for a question
export const createQuestionOptions = async (req, res) => {
  try {
    const { questionId } = req.params;
    let optionsData = req.body;

    const questionExists = await Questions.findByPk(questionId);
    if (!questionExists) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }

    // If options sent as JSON string, parse it
    if (typeof optionsData === 'string') {
      optionsData = JSON.parse(optionsData);
    }

    const optionsArray = Array.isArray(optionsData) ? optionsData : [optionsData];

    // Check for duplicates within request payload
    const labelsInRequest = optionsArray.map(opt => opt.option_label.toLowerCase().trim());
    const duplicateLabelsInRequest = labelsInRequest.filter((label, idx) => labelsInRequest.indexOf(label) !== idx);
    if (duplicateLabelsInRequest.length > 0) {
      return res.status(400).json({
        message: 'Duplicate option labels found in request: ' + [...new Set(duplicateLabelsInRequest)].join(', '),
        success: false,
      });
    }

    // Check duplicates in DB for same question
    const existingOptions = await QuestionOptions.findAll({
      where: {
        question_id: questionId,
        option_label: optionsArray.map(opt => opt.option_label.trim()),
      },
      attributes: ['option_label'],
      raw: true,
    });

    if (existingOptions.length > 0) {
      const existingLabels = existingOptions.map(opt => opt.option_label.toLowerCase());
      const duplicates = optionsArray
        .map(opt => opt.option_label.toLowerCase())
        .filter(label => existingLabels.includes(label));
      return res.status(400).json({
        message: 'Option labels already exist: ' + [...new Set(duplicates)].join(', '),
        success: false,
      });
    }

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
    const options = await QuestionOptions.findAll({
      where: { question_id: questionId },
    });
    return res.status(200).json({
      data: options,
      success: true,
      message: "Question options fetched successfully",
    });
  } catch (error) {
    console.error("Error in getQuestionOptionsByQuestion:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get option by id
export const getQuestionOptionById = async (req, res) => {
  try {
    const { optionId } = req.params;
    const option = await QuestionOptions.findByPk(optionId);
    if (!option) {
      return res
        .status(404)
        .json({ message: "Question option not found", success: false });
    }
    return res.status(200).json({
      data: option,
      success: true,
      message: "Question option fetched successfully",
    });
  } catch (error) {
    console.error("Error in getQuestionOptionById:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update option by id
export const updateQuestionOption = async (req, res) => {
  try {
    const { optionId } = req.params;
    const updatedData = { ...req.body };

    // Fetch existing option to get question_id and current option_label
    const existingOption = await QuestionOptions.findByPk(optionId);
    if (!existingOption) {
      return res.status(404).json({ message: 'Question option not found', success: false });
    }

    // Check for duplicate option_label when updating
    if (updatedData.option_label && updatedData.option_label.trim() !== existingOption.option_label) {
      const duplicate = await QuestionOptions.findOne({
        where: {
          question_id: existingOption.question_id,
          option_label: updatedData.option_label.trim(),
          id: { [Op.ne]: optionId },
        },
      });
      if (duplicate) {
        return res.status(400).json({
          message: 'Option label already exists for this question',
          success: false,
        });
      }
    }

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
      return res
        .status(404)
        .json({ message: "Question option not found", success: false });
    }
    return res.status(200).json({
      message: "Question option deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in deleteQuestionOption:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
