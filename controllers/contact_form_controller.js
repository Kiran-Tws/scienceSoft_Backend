import db from "../models/index.js";
const FinalContact = db.FinalContact;
const UserResponses = db.UserResponses;

// Create a final contact record
export const createFinalContact = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate sessionId presence
    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
        success: false,
      });
    }

    // Check if sessionId exists in UserResponses table
    const sessionExists = await UserResponses.findOne({
      where: { session_id: sessionId },
      attributes: ["session_id"], // minimal fetch
    });

    if (!sessionExists) {
      return res.status(404).json({
        message: "Session ID not found",
        success: false,
      });
    }

    // Merge session_id from params into request body to ensure data integrity
    const data = {
      ...req.body,
      session_id: sessionId,
    };

    // Create final contact record
    const createdContact = await FinalContact.create(data);

    return res.status(201).json({
      data: createdContact,
      success: true,
      message: "Final contact created successfully",
    });
  } catch (error) {
    console.error("Error in createFinalContact:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get final contact by id
export const getFinalContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await FinalContact.findByPk(contactId);
    if (!contact) {
      return res
        .status(404)
        .json({ message: "Final contact not found", success: false });
    }
    return res.status(200).json({
      data: contact,
      success: true,
      message: "Final contact fetched successfully",
    });
  } catch (error) {
    console.error("Error in getFinalContactById:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all final contacts by session id
export const getFinalContactsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const contact = await FinalContact.findOne({
      where: { session_id: sessionId },
    });

    if (!contact) {
      return res.status(404).json({
        message: "No contact data found for this session ID",
        success: false,
      });
    }

    return res.status(200).json({
      data: contact,
      success: true,
      message: "Contact deatils fetched successfully",
    });
  } catch (error) {
    console.error("Error in getFinalContactsBySession:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};


// Update final contact by id
export const updateFinalContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const updatedData = req.body;
    const [updated] = await FinalContact.update(updatedData, {
      where: { id: contactId },
    });
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Final contact not found", success: false });
    }
    const updatedContact = await FinalContact.findByPk(contactId);
    return res.status(200).json({
      data: updatedContact,
      success: true,
      message: "Final contact updated successfully",
    });
  } catch (error) {
    console.error("Error in updateFinalContact:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Delete final contact by id
export const deleteFinalContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const deleted = await FinalContact.destroy({ where: { id: contactId } });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Final contact not found", success: false });
    }
    return res.status(200).json({
      message: "Final contact deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in deleteFinalContact:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
