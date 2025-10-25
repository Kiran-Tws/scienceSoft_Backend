import db from "../models/index.js";
const UserResponses = db.UserResponses;
const FormSteps = db.FormSteps;
const Questions = db.Questions;
const QuestionOptions = db.QuestionOptions;
const Subcategories = db.Subcategories;
const Categories = db.Categories;
const Services = db.Services;
const FinalContact = db.FinalContact;
const sequelize = db.sequelize;
import { v4 as uuidv4 } from "uuid";

export const getAllInquiries = async (req, res) => {
  try {
    // Fetch all user responses with all associations
    const responses = await UserResponses.findAll({
      include: [
        {
          model: Questions,
          as: "question",
          attributes: [
            "id", "question_text", "input_type", "allow_other", "is_required"
          ],
        },
        {
          model: QuestionOptions,
          as: "selected_option",
          attributes: ["id", "option_label", "option_value", "is_other"],
        },
        {
          model: FormSteps,
          as: "form_step",
          attributes: ["id", "step_order", "title", "description"],
          include: [
            {
              model: Subcategories,
              as: "subcategory",
              attributes: ["id", "name", "icon", "description"],
              include: [
                {
                  model: Categories,
                  as: "category",
                  attributes: ["id", "name", "icon"],
                  include: [
                    {
                      model: Services,
                      as: "service",
                      attributes: ["id", "name", "description"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["session_id", "ASC"],
        [{ model: FormSteps, as: "form_step" }, "step_order", "ASC"],
        [{ model: Questions, as: "question" }, "question_text", "ASC"]
      ],
    });

    // Fetch all contacts in a single call for performance
    const allSessionIds = [...new Set(responses.map(r => r.session_id))];
    const finalContacts = await FinalContact.findAll({
      where: { session_id: allSessionIds },
      attributes: [
        "session_id", "name", "company_name", "work_email",
        "phone_number", "preferred_communication"
      ],
    });

    // Group responses by session_id
    const sessionGroups = {};
    for (const resp of responses) {
      if (!sessionGroups[resp.session_id]) sessionGroups[resp.session_id] = [];
      sessionGroups[resp.session_id].push(resp);
    }

    // Build the summary for each session
    const inquiries = [];
    for (const [sessionId, sessionResponses] of Object.entries(sessionGroups)) {
      const first = sessionResponses[0];
      const service = first.form_step.subcategory.category.service;
      const category = first.form_step.subcategory.category;
      const subcategory = first.form_step.subcategory;
      const contact = finalContacts.find(c => c.session_id === sessionId) || {};

      const questions = sessionResponses.map((resp, idx) => ({
        num: idx + 1,
        id: resp.question.id,
        question: resp.question.question_text,
        input_type: resp.question.input_type,
        answer: resp.selected_option
          ? resp.selected_option.option_label
          : resp.response_value,
        option_details: resp.selected_option
          ? {
              id: resp.selected_option.id,
              value: resp.selected_option.option_value,
              is_other: resp.selected_option.is_other,
            }
          : null,
      }));

      inquiries.push({
        sessionId,
        user_details: contact,
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
        },
        category: {
          id: category.id,
          name: category.name,
          icon: category.icon,
        },
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          icon: subcategory.icon,
          description: subcategory.description,
        },
        questions,
      });
    }

    return res.status(200).json({
      success: true,
      message: "All user inquiries",
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching all inquiries:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const fetchInquiriesDetailsBySessionId = async (req,res) => {
   try {
    const { sessionId } = req.params;

    // Fetch user responses for this session with associations
    const responses = await UserResponses.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: Questions,
          as: "question",
          attributes: ["id", "question_text", "input_type", "allow_other", "is_required"],
        },
        {
          model: QuestionOptions,
          as: "selected_option",
          attributes: ["id", "option_label", "option_value", "is_other"],
        },
        {
          model: FormSteps,
          as: "form_step",
          attributes: ["id", "step_order", "title", "description"],
          include: [
            {
              model: Subcategories,
              as: "subcategory",
              attributes: ["id", "name", "icon", "description"],
              include: [
                {
                  model: Categories,
                  as: "category",
                  attributes: ["id", "name", "icon"],
                  include: [
                    {
                      model: Services,
                      as: "service",
                      attributes: ["id", "name", "description"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: FormSteps, as: "form_step" }, "step_order", "ASC"],
        [{ model: Questions, as: "question" }, "question_text", "ASC"],
      ],
    });

    if (!responses.length) {
      return res.status(404).json({ success: false, message: "No responses found for this session" });
    }

    // Get contact info for this session
    const finalContact = await FinalContact.findOne({
      where: { session_id: sessionId },
      attributes: ["name", "company_name", "work_email", "phone_number", "preferred_communication"],
    });

    const first = responses[0];
    const service = first.form_step.subcategory.category.service;
    const category = first.form_step.subcategory.category;
    const subcategory = first.form_step.subcategory;

    const questions = responses.map((resp, idx) => ({
      num: idx + 1,
      id: resp.question.id,
      question: resp.question.question_text,
      input_type: resp.question.input_type,
      answer: resp.selected_option ? resp.selected_option.option_label : resp.response_value,
      option_details: resp.selected_option
        ? {
            id: resp.selected_option.id,
            value: resp.selected_option.option_value,
            is_other: resp.selected_option.is_other,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Inquiry details by session",
      data: {
        sessionId,
        user_details: finalContact || {},
        service: { id: service.id, name: service.name, description: service.description },
        category: { id: category.id, name: category.name, icon: category.icon },
        subcategory: { id: subcategory.id, name: subcategory.name, icon: subcategory.icon, description: subcategory.description },
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiry details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}


// Create single or multiple user responses - expects array in body
export const saveUserResponses = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { formStepId } = req.params;

    const formStep = await FormSteps.findByPk(formStepId, { transaction });
    if (!formStep) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Form step not found",
        success: false,
      });
    }

    const responses = Array.isArray(req.body)
      ? req.body
      : req.body.responses
      ? JSON.parse(req.body.responses)
      : [];

    if (!Array.isArray(responses) || responses.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Responses must be a non-empty array",
        success: false,
      });
    }

    let sessionId;

    if (formStep.step_order === 1) {
      sessionId = uuidv4();
    } else {
      sessionId = req.headers["x-session-id"];
      if (!sessionId) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Session ID header (x-session-id) is required for this step",
          success: false,
        });
      }

      const sessionExists = await UserResponses.findOne({
        where: { session_id: sessionId },
        transaction,
      });
      if (!sessionExists) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Session ID not found",
          success: false,
        });
      }
    }

    const questionIds = responses.map((r) => r.question_id);
    const questionsInStep = await Questions.findAll({
      where: {
        id: questionIds,
        form_step_id: formStepId,
      },
      transaction,
    });

    if (questionsInStep.length !== questionIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "One or more question IDs are invalid or do not belong to the form step",
        success: false,
      });
    }

    // Validate selected_option_id for each response
    for (const resp of responses) {
      if (resp.selected_option_id) {
        const option = await QuestionOptions.findOne({
          where: {
            id: resp.selected_option_id,
            question_id: resp.question_id,
          },
          transaction,
        });
        if (!option) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Selected option ID ${resp.selected_option_id} is invalid or does not belong to question ${resp.question_id}`,
            success: false,
          });
        }
      }
    }

    const createdOrUpdatedResponses = [];

    for (const resp of responses) {
      // Check if record exists for session, formStep, question
      const existingResponse = await UserResponses.findOne({
        where: {
          session_id: sessionId,
          form_step_id: formStepId,
          question_id: resp.question_id,
        },
        transaction,
      });

      if (existingResponse) {
        // Update existing record
        await existingResponse.update(
          {
            selected_option_id: resp.selected_option_id || null,
            response_value: resp.response_value || null,
          },
          { transaction }
        );

        createdOrUpdatedResponses.push(existingResponse);
      } else {
        // Create new record
        const newResp = await UserResponses.create(
          {
            ...resp,
            session_id: sessionId,
            form_step_id: formStepId,
          },
          { transaction }
        );
        createdOrUpdatedResponses.push(newResp);
      }
    }

    await transaction.commit();

    return res.status(201).json({
      data: createdOrUpdatedResponses,
      success: true,
      message: "Responses saved successfully",
      sessionId,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving user responses:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get user responses by sessionId
export const getUserResponsesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch user responses, include all info needed for hierarchy flat-pack
    const responses = await UserResponses.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: Questions,
          as: "question",
          attributes: [
            "id",
            "question_text",
            "input_type",
            "allow_other",
            "is_required",
          ],
        },
        {
          model: QuestionOptions,
          as: "selected_option",
          attributes: ["id", "option_label", "option_value", "is_other"],
        },
        {
          model: FormSteps,
          as: "form_step",
          attributes: ["id", "step_order", "title", "description"],
          include: [
            {
              model: Subcategories,
              as: "subcategory",
              attributes: ["id", "name", "icon", "description"],
              include: [
                {
                  model: Categories,
                  as: "category",
                  attributes: ["id", "name", "icon"],
                  include: [
                    {
                      model: Services,
                      as: "service",
                      attributes: ["id", "name", "description"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: FormSteps, as: "form_step" }, "step_order", "ASC"],
        [{ model: Questions, as: "question" }, "question_text", "ASC"],
      ],
    });

    if (!responses.length) {
      return res.status(404).json({
        message: "No responses found for this session",
        success: false,
      });
    }

    // Get contact info
    const finalContact = await FinalContact.findOne({
      where: { session_id: sessionId },
      attributes: [
        "name",
        "company_name",
        "work_email",
        "phone_number",
        "preferred_communication",
      ],
    });

    // Derive top-level info (common for all responses, assumes one service/category/subcategory)
    const first = responses[0];
    const service = first.form_step.subcategory.category.service;
    const category = first.form_step.subcategory.category;
    const subcategory = first.form_step.subcategory;

    // Pack questions simply as: [ {question_text, answer details}, ... ]
    const questions = responses.map((resp, idx) => ({
      num: idx + 1,
      id: resp.question.id,
      question: resp.question.question_text,
      input_type: resp.question.input_type,
      answer: resp.selected_option
        ? resp.selected_option.option_label
        : resp.response_value,
      option_details: resp.selected_option
        ? {
            id: resp.selected_option.id,
            value: resp.selected_option.option_value,
            is_other: resp.selected_option.is_other,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "User inquiry summary",
      data: {
        sessionId,
        user_details: finalContact,
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
        },
        category: {
          id: category.id,
          name: category.name,
          icon: category.icon,
        },
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          icon: subcategory.icon,
          description: subcategory.description,
        },
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching user responses by session:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get user response by id
export const getUserResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await UserResponses.findByPk(responseId);
    if (!response) {
      return res
        .status(404)
        .json({ message: "User response not found", success: false });
    }
    return res.status(200).json({
      data: response,
      success: true,
      message: "User response fetched successfully",
    });
  } catch (error) {
    console.error("Error in getUserResponseById:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update user response by id
export const updateUserResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const updatedData = { ...req.body };
    const [updated] = await UserResponses.update(updatedData, {
      where: { id: responseId },
    });
    if (!updated) {
      return res
        .status(404)
        .json({ message: "User response not found", success: false });
    }
    const updatedResponse = await UserResponses.findByPk(responseId);
    return res.status(200).json({
      data: updatedResponse,
      success: true,
      message: "User response updated successfully",
    });
  } catch (error) {
    console.error("Error in updateUserResponse:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete user response by id
export const deleteUserResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const deleted = await UserResponses.destroy({ where: { id: responseId } });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "User response not found", success: false });
    }
    return res.status(200).json({
      message: "User response deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in deleteUserResponse:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
