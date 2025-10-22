import express from "express";
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
} from "../controllers/service_controller.js";
import {
  createCategories,
  getCategoriesByService,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category_controller.js";
import { multipleFilesUpload, singleFileUpload } from "../utils/multerConfig.js";
import { createSubCategories, getSubCategoriesByCategory, getSubCategoryById, updateSubCategory } from "../controllers/sub_category_controller.js";
import { createFormSteps, deleteFormStep, getFormStepById, getFormStepsBySubCategory, updateFormStep } from "../controllers/form_steps_controller.js";
import { createQuestions, deleteQuestion, getQuestionById, getQuestionsByFormStep, updateQuestion } from "../controllers/questions_controller.js";
import { createQuestionOptions, deleteQuestionOption, getQuestionOptionById, getQuestionOptionsByQuestion, updateQuestionOption } from "../controllers/qus_options_controller.js";
import { createUserResponses, deleteUserResponse, getUserResponseById, getUserResponsesBySession, updateUserResponse } from "../controllers/user_response_controller.js";
import { createFinalContact, deleteFinalContact, getFinalContactById, getFinalContactsBySession, updateFinalContact } from "../controllers/contact_form_controller.js";

const router = express.Router();

//services routes
router.post("/create_service", createService);
router.get("/services", getAllServices);
router.get("/services/:id", getServiceById);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

//category routes
router.post('/services/:serviceId/categories',multipleFilesUpload('icons', 10),createCategories);
router.get('/services/:serviceId/categories', getCategoriesByService);
router.get('/categories/:categoryId', getCategoryById);
router.put('/categories/:categoryId', singleFileUpload('icon'), updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

//sub_category routes
router.post('/categories/:categoryId/sub_categories',multipleFilesUpload('icons', 10),createSubCategories);
router.get('/categories/:categoryId/sub_categories', getSubCategoriesByCategory);
router.get('/sub_categories/:subCategoryId', getSubCategoryById);
router.put('/sub_categories/:subCategoryId', singleFileUpload('icon'), updateSubCategory);
router.delete('/sub_categories/:subCategoryId', deleteCategory);

// Form steps routes
router.post('/subcategories/:subCategoryId/formsteps', createFormSteps);
router.get('/subcategories/:subCategoryId/formsteps', getFormStepsBySubCategory);
router.get('/formsteps/:formStepId', getFormStepById);
router.put('/formsteps/:formStepId', updateFormStep);
router.delete('/formsteps/:formStepId', deleteFormStep);

// Form_Qustions routes
router.post('/formsteps/:formStepId/questions', createQuestions);
router.get('/formsteps/:formStepId/questions', getQuestionsByFormStep);
router.get('/questions/:questionId', getQuestionById);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);

//Questions Options
router.post('/questions/:questionId/options', createQuestionOptions);
router.get('/questions/:questionId/options', getQuestionOptionsByQuestion);
router.get('/options/:optionId', getQuestionOptionById);
router.put('/options/:optionId', updateQuestionOption);
router.delete('/options/:optionId', deleteQuestionOption);

//Contact-form routes
router.post('/final-contacts', createFinalContact);
router.get('/final-contacts/:contactId', getFinalContactById);
router.get('/final-contacts/session/:sessionId', getFinalContactsBySession);
router.put('/final-contacts/:contactId', updateFinalContact);
router.delete('/final-contacts/:contactId', deleteFinalContact);

// User Response routes
router.post('/user-responses', createUserResponses);
router.get('/user-responses/session/:sessionId', getUserResponsesBySession);
router.get('/user-responses/:responseId', getUserResponseById);
router.put('/user-responses/:responseId', updateUserResponse);
router.delete('/user-responses/:responseId', deleteUserResponse);


export default router;
