// migrations/20251022-create-questions.mjs
import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('questions', {
    id: {
      type: UUID,
      defaultValue: literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true,
    },
    form_step_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: 'form_steps',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    input_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['text', 'number', 'radio', 'checkbox', 'dropdown']],
      },
    },
    allow_other: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('questions');
}
