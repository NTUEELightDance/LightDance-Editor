use sea_orm_migration::prelude::*;
use sea_query::{Alias, Expr};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let mut index_color_name = Index::create().unique().col(Color::Name).to_owned();
        manager
            .create_table(
                Table::create()
                    .table(Color::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Color::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Color::Name).string().not_null())
                    .col(ColumnDef::new(Color::R).integer().not_null())
                    .col(ColumnDef::new(Color::G).integer().not_null())
                    .col(ColumnDef::new(Color::B).integer().not_null())
                    .index(&mut index_color_name)
                    .to_owned(),
            )
            .await?;

        let mut index_control_frame_start =
            Index::create().unique().col(ControlFrame::Start).to_owned();
        manager
            .create_table(
                Table::create()
                    .table(ControlFrame::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ControlFrame::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ControlFrame::Start).integer().not_null())
                    .col(
                        ColumnDef::new(ControlFrame::MetaRev)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(ControlFrame::DataRev)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(ControlFrame::FadeForNewStatus)
                            .boolean()
                            .not_null(),
                    )
                    .index(&mut index_control_frame_start)
                    .to_owned(),
            )
            .await?;

        let mut index_position_frame_start = Index::create()
            .unique()
            .col(PositionFrame::Start)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(PositionFrame::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PositionFrame::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(PositionFrame::Start).integer().not_null())
                    .col(
                        ColumnDef::new(PositionFrame::MetaRev)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PositionFrame::DataRev)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .index(&mut index_position_frame_start)
                    .to_owned(),
            )
            .await?;

        let mut index_model_name = Index::create().unique().col(Model::Name).to_owned();
        manager
            .create_table(
                Table::create()
                    .table(Model::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Model::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Model::Name).string().not_null())
                    .index(&mut index_model_name)
                    .to_owned(),
            )
            .await?;

        let mut index_part_name_modelid = Index::create()
            .unique()
            .col(Part::Name)
            .col(Part::ModelId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(Part::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Part::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Part::ModelId).integer().not_null())
                    .col(ColumnDef::new(Part::Name).string().not_null())
                    .col(
                        ColumnDef::new(Part::Type)
                            .custom(Alias::new("ENUM('LED','FIBER')"))
                            .not_null(),
                    )
                    .col(ColumnDef::new(Part::Length).integer().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-part-model_id")
                            .from(Part::Table, Part::ModelId)
                            .to(Model::Table, Model::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(&mut index_part_name_modelid)
                    .to_owned(),
            )
            .await?;

        let mut index_dancer_name = Index::create().unique().col(Dancer::Name).to_owned();
        manager
            .create_table(
                Table::create()
                    .table(Dancer::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Dancer::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Dancer::Name).string().not_null())
                    .col(ColumnDef::new(Dancer::ModelId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-dancer-model_id")
                            .from(Dancer::Table, Dancer::ModelId)
                            .to(Model::Table, Model::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(&mut index_dancer_name)
                    .to_owned(),
            )
            .await?;

        let mut index_led_effect = Index::create()
            .unique()
            .col(LEDEffect::Name)
            .col(LEDEffect::ModelId)
            .col(LEDEffect::PartId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(LEDEffect::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LEDEffect::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(LEDEffect::Name).string().not_null())
                    .col(ColumnDef::new(LEDEffect::ModelId).integer().not_null())
                    .col(ColumnDef::new(LEDEffect::PartId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-led_effect-model_id")
                            .from(LEDEffect::Table, LEDEffect::ModelId)
                            .to(Model::Table, Model::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-led_effect-part_id")
                            .from(LEDEffect::Table, LEDEffect::PartId)
                            .to(Part::Table, Part::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(&mut index_led_effect)
                    .to_owned(),
            )
            .await?;

        let mut index_editing_control_frame = Index::create()
            .unique()
            .col(EditingControlFrame::FrameId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(EditingControlFrame::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EditingControlFrame::UserId)
                            .integer()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(EditingControlFrame::FrameId).integer().null())
                    .index(&mut index_editing_control_frame)
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-editing_control_frame-frame_id")
                            .from(EditingControlFrame::Table, EditingControlFrame::FrameId)
                            .to(ControlFrame::Table, ControlFrame::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        let mut index_editing_position_frame = Index::create()
            .unique()
            .col(EditingPositionFrame::FrameId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(EditingPositionFrame::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EditingPositionFrame::UserId)
                            .integer()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(EditingPositionFrame::FrameId).integer().null())
                    .index(&mut index_editing_position_frame)
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-editing_position_frame-frame_id")
                            .from(EditingPositionFrame::Table, EditingPositionFrame::FrameId)
                            .to(PositionFrame::Table, PositionFrame::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        let mut index_editing_led_effect = Index::create()
            .unique()
            .col(EditingLEDEffect::LedEffectId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(EditingLEDEffect::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EditingLEDEffect::UserId)
                            .integer()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(EditingLEDEffect::LedEffectId).integer().null())
                    .index(&mut index_editing_led_effect)
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-editing_led_effect-led_effect_id")
                            .from(EditingLEDEffect::Table, EditingLEDEffect::LedEffectId)
                            .to(LEDEffect::Table, LEDEffect::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        let mut pk_position_data = Index::create()
            .col(PositionData::DancerId)
            .col(PositionData::FrameId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(PositionData::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(PositionData::DancerId).integer().not_null())
                    .col(ColumnDef::new(PositionData::FrameId).integer().not_null())
                    .col(
                        ColumnDef::new(PositionData::Type)
                            .custom(Alias::new("ENUM('POSITION','NO_EFFECT')"))
                            .not_null(),
                    )
                    .col(ColumnDef::new(PositionData::X).double().null())
                    .col(ColumnDef::new(PositionData::Y).double().null())
                    .col(ColumnDef::new(PositionData::Z).double().null())
                    .col(
                        ColumnDef::new(PositionData::Rx)
                            .double()
                            .not_null()
                            .default(Expr::cust("0")),
                    )
                    .col(
                        ColumnDef::new(PositionData::Ry)
                            .double()
                            .not_null()
                            .default(Expr::cust("0")),
                    )
                    .col(
                        ColumnDef::new(PositionData::Rz)
                            .double()
                            .not_null()
                            .default(Expr::cust("0")),
                    )
                    .primary_key(&mut pk_position_data)
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-position_data-dancer_id")
                            .from(PositionData::Table, PositionData::DancerId)
                            .to(Dancer::Table, Dancer::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-position_data-frame_id")
                            .from(PositionData::Table, PositionData::FrameId)
                            .to(PositionFrame::Table, PositionFrame::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        let mut index_control_data = Index::create()
            .unique()
            .col(ControlData::DancerId)
            .col(ControlData::PartId)
            .col(ControlData::FrameId)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(ControlData::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ControlData::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ControlData::DancerId).integer().not_null())
                    .col(ColumnDef::new(ControlData::PartId).integer().not_null())
                    .col(ColumnDef::new(ControlData::FrameId).integer().not_null())
                    .col(
                        ColumnDef::new(ControlData::Type)
                            .custom(Alias::new("ENUM('COLOR','EFFECT','LED_BULBS','NO_EFFECT')"))
                            .not_null(),
                    )
                    .col(ColumnDef::new(ControlData::Fade).boolean().null())
                    .col(ColumnDef::new(ControlData::ColorId).integer().null())
                    .col(ColumnDef::new(ControlData::EffectId).integer().null())
                    .col(ColumnDef::new(ControlData::Alpha).integer().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-control_data-dancer_id")
                            .from(ControlData::Table, ControlData::DancerId)
                            .to(Dancer::Table, Dancer::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-control_data-part_id")
                            .from(ControlData::Table, ControlData::PartId)
                            .to(Part::Table, Part::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-control_data-frame_id")
                            .from(ControlData::Table, ControlData::FrameId)
                            .to(ControlFrame::Table, ControlFrame::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-control_data-color_id")
                            .from(ControlData::Table, ControlData::ColorId)
                            .to(Color::Table, Color::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-control_data-effect_id")
                            .from(ControlData::Table, ControlData::EffectId)
                            .to(LEDEffect::Table, LEDEffect::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(&mut index_control_data)
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(LEDBulb::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LEDBulb::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(LEDBulb::ControlId).integer().not_null())
                    .col(ColumnDef::new(LEDBulb::Position).integer().not_null())
                    .col(ColumnDef::new(LEDBulb::ColorId).integer().not_null())
                    .col(ColumnDef::new(LEDBulb::Alpha).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ledbulb-control_id")
                            .from(LEDBulb::Table, LEDBulb::ControlId)
                            .to(ControlData::Table, ControlData::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        let mut index_led_effect_state = Index::create()
            .unique()
            .col(LEDEffectState::EffectId)
            .col(LEDEffectState::Position)
            .to_owned();
        manager
            .create_table(
                Table::create()
                    .table(LEDEffectState::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LEDEffectState::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(LEDEffectState::EffectId).integer().not_null())
                    .col(ColumnDef::new(LEDEffectState::Position).integer().not_null())
                    .col(ColumnDef::new(LEDEffectState::ColorId).integer().not_null())
                    .col(ColumnDef::new(LEDEffectState::Alpha).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-led_effect_state-effect_id")
                            .from(LEDEffectState::Table, LEDEffectState::EffectId)
                            .to(LEDEffect::Table, LEDEffect::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(&mut index_led_effect_state)
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(EffectListData::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EffectListData::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(EffectListData::Start).integer().not_null())
                    .col(ColumnDef::new(EffectListData::End).integer().not_null())
                    .col(ColumnDef::new(EffectListData::Description).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(Logger::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Logger::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Logger::User).integer().not_null())
                    .col(ColumnDef::new(Logger::VariableValue).json().null())
                    .col(ColumnDef::new(Logger::FieldName).string().not_null())
                    .col(
                        ColumnDef::new(Logger::Time)
                            .timestamp()
                            .not_null()
                            .default(Expr::cust("CURRENT_TIMESTAMP")),
                    )
                    .col(ColumnDef::new(Logger::Status).string().not_null())
                    .col(ColumnDef::new(Logger::ErrorMessage).json().null())
                    .col(ColumnDef::new(Logger::Result).json().null())
                    .to_owned(),
            )
            .await?;

        let mut index_revision_uuid = Index::create().unique().col(Revision::Uuid).to_owned();
        manager
            .create_table(
                Table::create()
                    .table(Revision::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Revision::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Revision::Uuid).string().not_null())
                    .col(
                        ColumnDef::new(Revision::Time)
                            .timestamp()
                            .not_null()
                            .default(Expr::cust("CURRENT_TIMESTAMP")),
                    )
                    .index(&mut index_revision_uuid)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Revision::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Logger::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(EffectListData::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(LEDBulb::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(LEDEffectState::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(ControlData::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PositionData::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(EditingLEDEffect::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(EditingPositionFrame::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(EditingControlFrame::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(LEDEffect::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Dancer::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Part::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Model::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PositionFrame::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(ControlFrame::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Color::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(Iden)]
pub enum Color {
    #[iden = "Color"]
    Table,
    Id,
    Name,
    R,
    G,
    B,
}

#[derive(Iden)]
pub enum ControlFrame {
    #[iden = "ControlFrame"]
    Table,
    Id,
    Start,
    MetaRev,
    DataRev,
    FadeForNewStatus,
}

#[derive(Iden)]
pub enum PositionFrame {
    #[iden = "PositionFrame"]
    Table,
    Id,
    Start,
    MetaRev,
    DataRev,
}

#[derive(Iden)]
pub enum Model {
    #[iden = "Model"]
    Table,
    Id,
    Name,
}

#[derive(Iden)]
pub enum Part {
    #[iden = "Part"]
    Table,
    Id,
    ModelId,
    Name,
    Type,
    Length,
}

#[derive(Iden)]
pub enum Dancer {
    #[iden = "Dancer"]
    Table,
    Id,
    Name,
    ModelId,
}

#[derive(Iden)]
pub enum LEDEffect {
    #[iden = "LEDEffect"]
    Table,
    Id,
    Name,
    ModelId,
    PartId,
}

#[derive(Iden)]
pub enum EditingControlFrame {
    #[iden = "EditingControlFrame"]
    Table,
    UserId,
    FrameId,
}

#[derive(Iden)]
pub enum EditingPositionFrame {
    #[iden = "EditingPositionFrame"]
    Table,
    UserId,
    FrameId,
}

#[derive(Iden)]
pub enum EditingLEDEffect {
    #[iden = "EditingLEDEffect"]
    Table,
    UserId,
    LedEffectId,
}

#[derive(Iden)]
pub enum PositionData {
    #[iden = "PositionData"]
    Table,
    DancerId,
    FrameId,
    Type,
    X,
    Y,
    Z,
    Rx,
    Ry,
    Rz,
}

#[derive(Iden)]
pub enum ControlData {
    #[iden = "ControlData"]
    Table,
    Id,
    DancerId,
    PartId,
    FrameId,
    Type,
    Fade,
    ColorId,
    EffectId,
    Alpha,
}

#[derive(Iden)]
pub enum LEDBulb {
    #[iden = "LEDBulb"]
    Table,
    Id,
    ControlId,
    Position,
    ColorId,
    Alpha,
}

#[derive(Iden)]
pub enum LEDEffectState {
    #[iden = "LEDEffectState"]
    Table,
    Id,
    EffectId,
    Position,
    ColorId,
    Alpha,
}

#[derive(Iden)]
pub enum EffectListData {
    #[iden = "EffectListData"]
    Table,
    Id,
    Start,
    End,
    Description,
}

#[derive(Iden)]
pub enum Logger {
    #[iden = "Logger"]
    Table,
    Id,
    User,
    VariableValue,
    FieldName,
    Time,
    Status,
    ErrorMessage,
    Result,
}

#[derive(Iden)]
pub enum Revision {
    #[iden = "Revision"]
    Table,
    Id,
    Uuid,
    Time,
}
