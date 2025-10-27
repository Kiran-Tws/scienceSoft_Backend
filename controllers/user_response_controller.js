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
        ["session_id", "ASC"],
        [{ model: FormSteps, as: "form_step" }, "step_order", "ASC"],
        [{ model: Questions, as: "question" }, "question_text", "ASC"],
      ],
    });

    // Fetch all contacts in a single call for performance
    const allSessionIds = [...new Set(responses.map((r) => r.session_id))];
    const finalContacts = await FinalContact.findAll({
      where: { session_id: allSessionIds },
      attributes: [
        "session_id",
        "name",
        "company_name",
        "work_email",
        "phone_number",
        "preferred_communication",
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
      const contact =
        finalContacts.find((c) => c.session_id === sessionId) || {};

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

export const fetchInquiriesDetailsBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch user responses for this session with associations
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
        success: false,
        message: "No responses found for this session",
      });
    }

    // Get contact info for this session
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

    const first = responses[0];
    const service = first.form_step.subcategory.category.service;
    const category = first.form_step.subcategory.category;
    const subcategory = first.form_step.subcategory;

    // const questions = responses.map((resp, idx) => ({
    //   num: idx + 1,
    //   id: resp.question.id,
    //   question: resp.question.question_text,
    //   input_type: resp.question.input_type,
    //   answer: resp.selected_option
    //     ? resp.selected_option.option_label
    //     : resp.response_value,
    //   option_details: resp.selected_option
    //     ? {
    //         id: resp.selected_option.id,
    //         value: resp.selected_option.option_value,
    //         is_other: resp.selected_option.is_other,
    //       }
    //     : null,
    // }));

    // Group responses by question id
    const questionMap = {};

    responses.forEach((resp) => {
      const qid = resp.question.id;

      if (!questionMap[qid]) {
        questionMap[qid] = {
          id: qid,
          question: resp.question.question_text,
          input_type: resp.question.input_type,
          is_required: resp.question.is_required,
          allow_other: resp.question.allow_other,
          answers: [],
          option_details: [],
        };
      }

      // Append answers and details for checkboxes (and single value for radios/text)
      if (resp.selected_option) {
        questionMap[qid].answers.push(resp.selected_option.option_label);
        questionMap[qid].option_details.push({
          id: resp.selected_option.id,
          value: resp.selected_option.option_value,
          is_other: resp.selected_option.is_other,
        });
      } else if (resp.response_value) {
        questionMap[qid].answers.push(resp.response_value);
      }
    });

    // Convert to array and add nums
    const questions = Object.values(questionMap).map((q, idx) => ({
      ...q,
      num: idx + 1,
    }));

    return res.status(200).json({
      success: true,
      message: "Inquiry details by session",
      data: {
        sessionId,
        user_details: finalContact || {},
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
        },
        category: { id: category.id, name: category.name, icon: category.icon },
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
    console.error("Error fetching inquiry details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create single or multiple user responses - expects array in body

export const saveUserResponses = async (req, res) => {
  console.log("PROCESS HAS STARTED");

  try {
    await sequelize.transaction(async (transaction) => {
      const { formStepId } = req.params;
      console.log("formStepId ->>", formStepId);

      const formStep = await FormSteps.findByPk(formStepId, { transaction });
      console.log("formStep ->", formStep);

      if (!formStep) {
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

      console.log("responses ->>", responses);

      if (!Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({
          message: "Responses must be a non-empty array",
          success: false,
        });
      }

      let sessionId;

      if (formStep.step_order === 1) {
        sessionId = uuidv4();
        console.log("sessionId ->>", sessionId);
      } else {
        sessionId = req.headers["x-session-id"];
        console.log("sessionId ->>", sessionId);

        if (!sessionId) {
          return res.status(400).json({
            message: "Session ID header (x-session-id) is required for this step",
            success: false,
          });
        }

        const sessionExists = await UserResponses.findOne({
          where: { session_id: sessionId },
          transaction,
        });
        console.log("sessionExists ->>", sessionExists);

        if (!sessionExists) {
          return res.status(404).json({
            message: "Session ID not found",
            success: false,
          });
        }
      }

      const questionIds = [...new Set(responses.map((r) => r.question_id))];

      console.log("questionIds ->", questionIds);

      const questionsInStep = await Questions.findAll({
        where: {
          id: questionIds,
          form_step_id: formStepId,
        },
        transaction,
      });
      console.log("questionsInStep ->", questionsInStep);

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
            return res.status(400).json({
              message: `Selected option ID ${resp.selected_option_id} is invalid or does not belong to question ${resp.question_id}`,
              success: false,
            });
          }
        }
      }

      // Fetch existing responses for session, step, question ids
      const existingResponses = await UserResponses.findAll({
        where: {
          session_id: sessionId,
          form_step_id: formStepId,
          question_id: questionIds,
        },
        transaction,
      });

      // Build sets for easy lookup from existing and incoming responses
      const incomingResponsesSet = new Set(
        responses.map((r) => `${r.question_id}-${r.selected_option_id || "null"}`)
      );

      const existingResponsesSet = new Set(
        existingResponses.map(
          (r) => `${r.question_id}-${r.selected_option_id || "null"}`
        )
      );

      // Delete DB records that exist but are NOT in incoming payload
      for (const dbResp of existingResponses) {
        const key = `${dbResp.question_id}-${dbResp.selected_option_id || "null"}`;
        if (!incomingResponsesSet.has(key)) {
          await dbResp.destroy({ transaction });
        }
      }

      // Create or update records from incoming payload
      const createdOrUpdatedResponses = [];

      for (const resp of responses) {
        const key = `${resp.question_id}-${resp.selected_option_id || "null"}`;
        const existingResponse = existingResponses.find(
          (r) => r.question_id === resp.question_id && r.selected_option_id === resp.selected_option_id
        );

        if (existingResponse) {
          await existingResponse.update(
            {
              selected_option_id: resp.selected_option_id || null,
              response_value: resp.response_value || null,
            },
            { transaction }
          );
          createdOrUpdatedResponses.push(existingResponse);
        } else {
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

      res.status(201).json({
        data: createdOrUpdatedResponses,
        success: true,
        message: "Responses saved successfully",
        sessionId,
      });
    });
  } catch (error) {
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

    // 1. Group all UserResponses by question_id
    const groupedResponses = {};

    responses.forEach((resp) => {
      const qid = resp.question.id;
      if (!groupedResponses[qid]) {
        groupedResponses[qid] = {
          num: 0, // will set later
          id: qid,
          question: resp.question.question_text,
          input_type: resp.question.input_type,
          is_required: resp.question.is_required,
          allow_other: resp.question.allow_other,
          answers: [],
          option_details: [],
        };
      }
      // For checkboxes/radios, collect all selected values
      groupedResponses[qid].answers.push(
        resp.selected_option
          ? resp.selected_option.option_label
          : resp.response_value
      );
      if (resp.selected_option) {
        groupedResponses[qid].option_details.push({
          id: resp.selected_option.id,
          value: resp.selected_option.option_value,
          is_other: resp.selected_option.is_other,
        });
      }
    });

    // 2. Convert to array and assign numbers
    const questions = Object.values(groupedResponses).map((q, idx) => ({
      ...q,
      num: idx + 1,
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

    // Pack questions simply as: [ {question_text, answer details}, ... ]
    // const questions = responses.map((resp, idx) => ({
    //   num: idx + 1,
    //   id: resp.question.id,
    //   question: resp.question.question_text,
    //   input_type: resp.question.input_type,
    //   answer: resp.selected_option
    //     ? resp.selected_option.option_label
    //     : resp.response_value,
    //   option_details: resp.selected_option
    //     ? {
    //         id: resp.selected_option.id,
    //         value: resp.selected_option.option_value,
    //         is_other: resp.selected_option.is_other,
    //       }
    //     : null,
    // }));
    // Group responses by question_id
    // const grouped = {};

    // responses.forEach((resp) => {
    //   const qId = resp.question.id;
    //   if (!grouped[qId]) {
    //     grouped[qId] = {
    //       num: 0, // We'll update later if you need numbering
    //       id: resp.question.id,
    //       question: resp.question.question_text,
    //       input_type: resp.question.input_type,
    //       answers: [],
    //       option_details: [],
    //       is_required: resp.question.is_required,
    //       allow_other: resp.question.allow_other,
    //     };
    //   }

    //   grouped[qId].answers.push(
    //     resp.selected_option
    //       ? resp.selected_option.option_label
    //       : resp.response_value
    //   );
    //   if (resp.selected_option) {
    //     grouped[qId].option_details.push({
    //       id: resp.selected_option.id,
    //       value: resp.selected_option.option_value,
    //       is_other: resp.selected_option.is_other,
    //     });
    //   }
    // });

    // // Convert to array and assign number
    // const questions = Object.values(grouped).map((q, idx) => ({
    //   ...q,
    //   num: idx + 1,
    // }));

    // return res.status(200).json({
    //   success: true,
    //   message: "User inquiry summary",
    //   data: {
    //     sessionId,
    //     user_details: finalContact,
    //     service: {
    //       id: service.id,
    //       name: service.name,
    //       description: service.description,
    //     },
    //     category: {
    //       id: category.id,
    //       name: category.name,
    //       icon: category.icon,
    //     },
    //     subcategory: {
    //       id: subcategory.id,
    //       name: subcategory.name,
    //       icon: subcategory.icon,
    //       description: subcategory.description,
    //     },
    //     questions,
    //   },
    // });

    // return res.status(200).json({
    //   success: true,
    //   message: "User inquiry summary",
    //   data: {
    //     sessionId,
    //     user_details: finalContact,
    //     service: {
    //       id: service.id,
    //       name: service.name,
    //       description: service.description,
    //     },
    //     category: {
    //       id: category.id,
    //       name: category.name,
    //       icon: category.icon,
    //     },
    //     subcategory: {
    //       id: subcategory.id,
    //       name: subcategory.name,
    //       icon: subcategory.icon,
    //       description: subcategory.description,
    //     },
    //     questions,
    //   },
    // });
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
