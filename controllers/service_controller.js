import db from "../models/index.js"; // Adjust path accordingly
const Services = db.Services;
import { Op } from "sequelize";


export const createService = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({
          message: "Service name is required and must be a non-empty string",
          success: false,
        });
    }

    // Check if service with same name already exists
    const existingService = await Services.findOne({
      where: { name: name.trim() },
    });

    if (existingService) {
      return res
        .status(400)
        .json({ message: "Service name already exists", success: false });
    }

    const service = await Services.create({ ...req.body, name: name.trim() });

    return res.status(201).json({
      data: service,
      success: true,
      message: "Service created successfully",
    });
  } catch (error) {
    console.log("Error while calling createService API:", error);
    return res.status(500).json({ message: error.message, success: false });
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
    const { id } = req.params;
    const { name } = req.body;

    // If updating name, check for duplicates excluding current record
    if (name && typeof name === "string" && name.trim() !== "") {
      const existingService = await Services.findOne({
        where: {
          name: name.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existingService) {
        return res
          .status(400)
          .json({ message: "Service name already exists", success: false });
      }
    }

    const [updated] = await Services.update(req.body, { where: { id } });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Service not found", success: false });
    }

    const updatedService = await Services.findByPk(id);

    return res.status(200).json({
      data: updatedService,
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.log("Error while calling updateService API:", error);
    return res.status(500).json({ message: error.message, success: false });
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
