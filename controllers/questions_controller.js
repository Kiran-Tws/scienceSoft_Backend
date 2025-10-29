import db from "../models/index.js";
const Questions = db.Questions;
const FormSteps = db.FormSteps;
const QuestionOptions = db.QuestionOptions;
import { Op } from "sequelize";

// Create single or multiple questions for a form step
export const createQuestions = async (req, res) => {
  try {
    const { formStepId } = req.params;

    // Check if form step exists
    const formStepExists = await FormSteps.findByPk(formStepId);
    if (!formStepExists) {
      return res
        .status(404)
        .json({ message: "Form step not found", success: false });
    }

    let questionsData = req.body;

    // If questions sent as JSON string, parse it
    if (typeof questionsData === "string") {
      questionsData = JSON.parse(questionsData);
    }

    // Always treat as array for bulkCreate
    const questionsArray = Array.isArray(questionsData)
      ? questionsData
      : [questionsData];

    // Check for duplicates in request payload
    const namesInRequest = questionsArray.map((q) =>
      q.question_text.toLowerCase().trim()
    );
    const duplicateNamesInRequest = namesInRequest.filter(
      (name, idx) => namesInRequest.indexOf(name) !== idx
    );
    if (duplicateNamesInRequest.length > 0) {
      return res.status(400).json({
        message:
          "Duplicate question texts found in the request: " +
          [...new Set(duplicateNamesInRequest)].join(", "),
        success: false,
      });
    }

    // Check for duplicates in DB for the same form step
    const existingQuestions = await Questions.findAll({
      where: {
        form_step_id: formStepId,
        question_text: questionsArray.map((q) => q.question_text.trim()),
      },
      attributes: ["question_text"],
      raw: true,
    });

    if (existingQuestions.length > 0) {
      const existingNames = existingQuestions.map((q) =>
        q.question_text.toLowerCase()
      );
      const duplicates = questionsArray
        .map((q) => q.question_text.toLowerCase())
        .filter((name) => existingNames.includes(name));
      return res.status(400).json({
        message:
          "Question texts already exist: " +
          [...new Set(duplicates)].join(", "),
        success: false,
      });
    }

    const questionsToCreate = questionsArray.map((q) => ({
      ...q,
      form_step_id: formStepId,
    }));

    const createdQuestions = await Questions.bulkCreate(questionsToCreate);

    return res.status(201).json({
      data: createdQuestions,
      success: true,
      message: "Questions created successfully",
    });
  } catch (error) {
    console.error("Error in createQuestions:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all questions by formStep id
export const getQuestionsByFormStep = async (req, res) => {
  try {
    const { formStepId } = req.params;
    const questions = await Questions.findAll({
      where: { form_step_id: formStepId },
    });
    return res.status(200).json({
      data: questions,
      success: true,
      message: "Questions fetched successfully",
    });
  } catch (error) {
    console.error("Error in getQuestionsByFormStep:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get question by id
export const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Questions.findByPk(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ message: "Question not found", success: false });
    }
    return res.status(200).json({
      data: question,
      success: true,
      message: "Question fetched successfully",
    });
  } catch (error) {
    console.error("Error in getQuestionById:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update question by id
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updatedData = { ...req.body };

    // Fetch existing question to get form_step_id and current question_text
    const existingQuestion = await Questions.findByPk(questionId);
    if (!existingQuestion) {
      return res
        .status(404)
        .json({ message: "Question not found", success: false });
    }

    // If updating question_text, validate uniqueness within same form_step_id
    if (
      updatedData.question_text &&
      updatedData.question_text.trim() !== existingQuestion.question_text
    ) {
      const duplicate = await Questions.findOne({
        where: {
          form_step_id: existingQuestion.form_step_id,
          question_text: updatedData.question_text.trim(),
          id: { [Op.ne]: questionId },
        },
      });
      if (duplicate) {
        return res.status(400).json({
          message: "Question text already exists in this form step",
          success: false,
        });
      }
    }

    const [updated] = await Questions.update(updatedData, {
      where: { id: questionId },
    });
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Question not found", success: false });
    }

    const updatedQuestion = await Questions.findByPk(questionId);
    return res.status(200).json({
      data: updatedQuestion,
      success: true,
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error in updateQuestion:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete question by id
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Delete dependent options first explicitly
    await QuestionOptions.destroy({ where: { question_id: questionId } });

    const deleted = await Questions.destroy({ where: { id: questionId } });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Question not found", success: false });
    }

    return res
      .status(200)
      .json({ message: "Question deleted successfully", success: true });
  } catch (error) {
    console.error("Error in deleteQuestion:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
