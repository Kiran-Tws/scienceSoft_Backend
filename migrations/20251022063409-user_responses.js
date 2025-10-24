// migrations/20251022-create-user-responses.mjs
import { literal, UUID, DataTypes } from "sequelize";

export async function up(queryInterface) {
  // Enable uuid-ossp extension for uuid_generate_v4()
  await queryInterface.sequelize.query(
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
  );

  // Create user_responses table
  await queryInterface.createTable("user_responses", {
    id: {
      type: UUID,
      defaultValue: literal("uuid_generate_v4()"),
      allowNull: false,
      primaryKey: true,
    },
    session_id: {
      type: UUID,
      allowNull: false,
    },
    form_step_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: "form_steps",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    question_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: "questions",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    selected_option_id: {
      type: UUID,
      allowNull: true,
      references: {
        model: "question_options",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    response_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal("NOW()"),
    },
    // updatedAt is disabled as per your model
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("user_responses");
}
