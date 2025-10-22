import db from '../models/index.js';
const UserResponses = db.UserResponses;

// Create single or multiple user responses - expects array in body
export const createUserResponses = async (req, res) => {
  try {
    let responses = req.body;
    // If sent as JSON string, parse it
    if (typeof responses === 'string') {
      responses = JSON.parse(responses);
    }
    // Wrap in array if single object
    const responsesArray = Array.isArray(responses) ? responses : [responses];

    const createdResponses = await UserResponses.bulkCreate(responsesArray);

    return res.status(201).json({
      data: createdResponses,
      success: true,
      message: 'User responses created successfully',
    });
  } catch (error) {
    console.error('Error in createUserResponses:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get user responses by sessionId
export const getUserResponsesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const responses = await UserResponses.findAll({ where: { session_id: sessionId } });
    return res.status(200).json({
      data: responses,
      success: true,
      message: 'User responses fetched successfully',
    });
  } catch (error) {
    console.error('Error in getUserResponsesBySession:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get user response by id
export const getUserResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await UserResponses.findByPk(responseId);
    if (!response) {
      return res.status(404).json({ message: 'User response not found', success: false });
    }
    return res.status(200).json({
      data: response,
      success: true,
      message: 'User response fetched successfully',
    });
  } catch (error) {
    console.error('Error in getUserResponseById:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Update user response by id
export const updateUserResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const updatedData = { ...req.body };
    const [updated] = await UserResponses.update(updatedData, { where: { id: responseId } });
    if (!updated) {
      return res.status(404).json({ message: 'User response not found', success: false });
    }
    const updatedResponse = await UserResponses.findByPk(responseId);
    return res.status(200).json({
      data: updatedResponse,
      success: true,
      message: 'User response updated successfully',
    });
  } catch (error) {
    console.error('Error in updateUserResponse:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete user response by id
export const deleteUserResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const deleted = await UserResponses.destroy({ where: { id: responseId } });
    if (!deleted) {
      return res.status(404).json({ message: 'User response not found', success: false });
    }
    return res.status(200).json({
      message: 'User response deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error in deleteUserResponse:', error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
