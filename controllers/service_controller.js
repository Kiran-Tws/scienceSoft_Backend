import db from '../models/index.js'; // Adjust path accordingly
const Services = db.Services;

export const createService = async (req, res) => {
  try {
    const service = await Services.create(req.body);
    return res.status(201).json({
      data: service,
      success: true,
      message: "Service created successfully",
    });
  } catch (error) {
    console.log("Error while calling createService API:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Services.findAll();
    return res.status(200).json({
      data: services,
      success: true,
      message: "Services fetched successfully",
    });
  } catch (error) {
    console.log("Error while calling getAllServices API:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Services.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({
        message: "Service not found",
        success: false,
      });
    }
    return res.status(200).json({
      data: service,
      success: true,
      message: "Service fetched successfully",
    });
  } catch (error) {
    console.log("Error while calling getServiceById API:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const [updated] = await Services.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({
        message: "Service not found",
        success: false,
      });
    }
    const updatedService = await Services.findByPk(req.params.id);
    return res.status(200).json({
      data: updatedService,
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.log("Error while calling updateService API:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const deleted = await Services.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({
        message: "Service not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Service deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error while calling deleteService API:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
