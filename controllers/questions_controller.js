import db from '../models/index.js';
const Questions = db.Questions;

// Create single or multiple questions for a form step
export const createQuestions = async (req, res) => {
  try {
    const { formStepId } = req.params;
    let questionsData = req.body;

    // If questions sent as JSON string, parse it
    if (typeof questionsData.questions === 'string') {
      questionsData = JSON.parse(questionsData.questions);
    }

    // Always treat as array for bulkCreate
    const questionsArray = Array.isArray(questionsData) ? questionsData : [questionsData];

    const questionsToCreate = questionsArray.map(q => ({
      ...q,
      form_step_id: formStepId,
    }));

    const createdQuestions = await Questions.bulkCreate(questionsToCreate);

    return res.status(201).json({
      data: createdQuestions,
      success: true,
      message: 'Questions created successfully',
    });
  } catch (error) {
    console.error('Error in createQuestions:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all questions by formStep id
export const getQuestionsByFormStep = async (req, res) => {
  try {
    const { formStepId } = req.params;
    const questions = await Questions.findAll({ where: { form_step_id: formStepId } });
    return res.status(200).json({
      data: questions,
      success: true,
      message: 'Questions fetched successfully',
    });
  } catch (error) {
    console.error('Error in getQuestionsByFormStep:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get question by id
export const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Questions.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    return res.status(200).json({
      data: question,
      success: true,
      message: 'Question fetched successfully',
    });
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update question by id
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updatedData = { ...req.body };
    const [updated] = await Questions.update(updatedData, { where: { id: questionId } });
    if (!updated) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    const updatedQuestion = await Questions.findByPk(questionId);
    return res.status(200).json({
      data: updatedQuestion,
      success: true,
      message: 'Question updated successfully',
    });
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete question by id
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await Questions.destroy({ where: { id: questionId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    return res.status(200).json({
      message: 'Question deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
