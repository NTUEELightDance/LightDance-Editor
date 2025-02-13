//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.4

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "EditingLEDEffect")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub user_id: i32,
    #[sea_orm(unique)]
    pub led_effect_id: Option<i32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::led_effect::Entity",
        from = "Column::LedEffectId",
        to = "super::led_effect::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    LedEffect,
}

impl Related<super::led_effect::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LedEffect.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
