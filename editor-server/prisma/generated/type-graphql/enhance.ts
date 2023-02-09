import { ClassType } from "type-graphql";
import * as tslib from "tslib";
import * as crudResolvers from "./resolvers/crud/resolvers-crud.index";
import * as argsTypes from "./resolvers/crud/args.index";
import * as actionResolvers from "./resolvers/crud/resolvers-actions.index";
import * as relationResolvers from "./resolvers/relations/resolvers.index";
import * as models from "./models";
import * as outputTypes from "./resolvers/outputs";
import * as inputTypes from "./resolvers/inputs";

const crudResolversMap = {
  Color: crudResolvers.ColorCrudResolver,
  LEDEffect: crudResolvers.LEDEffectCrudResolver,
  User: crudResolvers.UserCrudResolver,
  EditingPositionFrame: crudResolvers.EditingPositionFrameCrudResolver,
  EditingControlFrame: crudResolvers.EditingControlFrameCrudResolver,
  Dancer: crudResolvers.DancerCrudResolver,
  Part: crudResolvers.PartCrudResolver,
  PositionData: crudResolvers.PositionDataCrudResolver,
  PositionFrame: crudResolvers.PositionFrameCrudResolver,
  ControlData: crudResolvers.ControlDataCrudResolver,
  ControlFrame: crudResolvers.ControlFrameCrudResolver,
  EffectListData: crudResolvers.EffectListDataCrudResolver,
  Logger: crudResolvers.LoggerCrudResolver
};
const actionResolversMap = {
  Color: {
    aggregateColor: actionResolvers.AggregateColorResolver,
    createManyColor: actionResolvers.CreateManyColorResolver,
    createOneColor: actionResolvers.CreateOneColorResolver,
    deleteManyColor: actionResolvers.DeleteManyColorResolver,
    deleteOneColor: actionResolvers.DeleteOneColorResolver,
    findFirstColor: actionResolvers.FindFirstColorResolver,
    findFirstColorOrThrow: actionResolvers.FindFirstColorOrThrowResolver,
    colors: actionResolvers.FindManyColorResolver,
    color: actionResolvers.FindUniqueColorResolver,
    getColor: actionResolvers.FindUniqueColorOrThrowResolver,
    groupByColor: actionResolvers.GroupByColorResolver,
    updateManyColor: actionResolvers.UpdateManyColorResolver,
    updateOneColor: actionResolvers.UpdateOneColorResolver,
    upsertOneColor: actionResolvers.UpsertOneColorResolver
  },
  LEDEffect: {
    aggregateLEDEffect: actionResolvers.AggregateLEDEffectResolver,
    createManyLEDEffect: actionResolvers.CreateManyLEDEffectResolver,
    createOneLEDEffect: actionResolvers.CreateOneLEDEffectResolver,
    deleteManyLEDEffect: actionResolvers.DeleteManyLEDEffectResolver,
    deleteOneLEDEffect: actionResolvers.DeleteOneLEDEffectResolver,
    findFirstLEDEffect: actionResolvers.FindFirstLEDEffectResolver,
    findFirstLEDEffectOrThrow: actionResolvers.FindFirstLEDEffectOrThrowResolver,
    lEDEffects: actionResolvers.FindManyLEDEffectResolver,
    lEDEffect: actionResolvers.FindUniqueLEDEffectResolver,
    getLEDEffect: actionResolvers.FindUniqueLEDEffectOrThrowResolver,
    groupByLEDEffect: actionResolvers.GroupByLEDEffectResolver,
    updateManyLEDEffect: actionResolvers.UpdateManyLEDEffectResolver,
    updateOneLEDEffect: actionResolvers.UpdateOneLEDEffectResolver,
    upsertOneLEDEffect: actionResolvers.UpsertOneLEDEffectResolver
  },
  User: {
    aggregateUser: actionResolvers.AggregateUserResolver,
    createManyUser: actionResolvers.CreateManyUserResolver,
    createOneUser: actionResolvers.CreateOneUserResolver,
    deleteManyUser: actionResolvers.DeleteManyUserResolver,
    deleteOneUser: actionResolvers.DeleteOneUserResolver,
    findFirstUser: actionResolvers.FindFirstUserResolver,
    findFirstUserOrThrow: actionResolvers.FindFirstUserOrThrowResolver,
    users: actionResolvers.FindManyUserResolver,
    user: actionResolvers.FindUniqueUserResolver,
    getUser: actionResolvers.FindUniqueUserOrThrowResolver,
    groupByUser: actionResolvers.GroupByUserResolver,
    updateManyUser: actionResolvers.UpdateManyUserResolver,
    updateOneUser: actionResolvers.UpdateOneUserResolver,
    upsertOneUser: actionResolvers.UpsertOneUserResolver
  },
  EditingPositionFrame: {
    aggregateEditingPositionFrame: actionResolvers.AggregateEditingPositionFrameResolver,
    createManyEditingPositionFrame: actionResolvers.CreateManyEditingPositionFrameResolver,
    createOneEditingPositionFrame: actionResolvers.CreateOneEditingPositionFrameResolver,
    deleteManyEditingPositionFrame: actionResolvers.DeleteManyEditingPositionFrameResolver,
    deleteOneEditingPositionFrame: actionResolvers.DeleteOneEditingPositionFrameResolver,
    findFirstEditingPositionFrame: actionResolvers.FindFirstEditingPositionFrameResolver,
    findFirstEditingPositionFrameOrThrow: actionResolvers.FindFirstEditingPositionFrameOrThrowResolver,
    editingPositionFrames: actionResolvers.FindManyEditingPositionFrameResolver,
    editingPositionFrame: actionResolvers.FindUniqueEditingPositionFrameResolver,
    getEditingPositionFrame: actionResolvers.FindUniqueEditingPositionFrameOrThrowResolver,
    groupByEditingPositionFrame: actionResolvers.GroupByEditingPositionFrameResolver,
    updateManyEditingPositionFrame: actionResolvers.UpdateManyEditingPositionFrameResolver,
    updateOneEditingPositionFrame: actionResolvers.UpdateOneEditingPositionFrameResolver,
    upsertOneEditingPositionFrame: actionResolvers.UpsertOneEditingPositionFrameResolver
  },
  EditingControlFrame: {
    aggregateEditingControlFrame: actionResolvers.AggregateEditingControlFrameResolver,
    createManyEditingControlFrame: actionResolvers.CreateManyEditingControlFrameResolver,
    createOneEditingControlFrame: actionResolvers.CreateOneEditingControlFrameResolver,
    deleteManyEditingControlFrame: actionResolvers.DeleteManyEditingControlFrameResolver,
    deleteOneEditingControlFrame: actionResolvers.DeleteOneEditingControlFrameResolver,
    findFirstEditingControlFrame: actionResolvers.FindFirstEditingControlFrameResolver,
    findFirstEditingControlFrameOrThrow: actionResolvers.FindFirstEditingControlFrameOrThrowResolver,
    editingControlFrames: actionResolvers.FindManyEditingControlFrameResolver,
    editingControlFrame: actionResolvers.FindUniqueEditingControlFrameResolver,
    getEditingControlFrame: actionResolvers.FindUniqueEditingControlFrameOrThrowResolver,
    groupByEditingControlFrame: actionResolvers.GroupByEditingControlFrameResolver,
    updateManyEditingControlFrame: actionResolvers.UpdateManyEditingControlFrameResolver,
    updateOneEditingControlFrame: actionResolvers.UpdateOneEditingControlFrameResolver,
    upsertOneEditingControlFrame: actionResolvers.UpsertOneEditingControlFrameResolver
  },
  Dancer: {
    aggregateDancer: actionResolvers.AggregateDancerResolver,
    createManyDancer: actionResolvers.CreateManyDancerResolver,
    createOneDancer: actionResolvers.CreateOneDancerResolver,
    deleteManyDancer: actionResolvers.DeleteManyDancerResolver,
    deleteOneDancer: actionResolvers.DeleteOneDancerResolver,
    findFirstDancer: actionResolvers.FindFirstDancerResolver,
    findFirstDancerOrThrow: actionResolvers.FindFirstDancerOrThrowResolver,
    dancers: actionResolvers.FindManyDancerResolver,
    dancer: actionResolvers.FindUniqueDancerResolver,
    getDancer: actionResolvers.FindUniqueDancerOrThrowResolver,
    groupByDancer: actionResolvers.GroupByDancerResolver,
    updateManyDancer: actionResolvers.UpdateManyDancerResolver,
    updateOneDancer: actionResolvers.UpdateOneDancerResolver,
    upsertOneDancer: actionResolvers.UpsertOneDancerResolver
  },
  Part: {
    aggregatePart: actionResolvers.AggregatePartResolver,
    createManyPart: actionResolvers.CreateManyPartResolver,
    createOnePart: actionResolvers.CreateOnePartResolver,
    deleteManyPart: actionResolvers.DeleteManyPartResolver,
    deleteOnePart: actionResolvers.DeleteOnePartResolver,
    findFirstPart: actionResolvers.FindFirstPartResolver,
    findFirstPartOrThrow: actionResolvers.FindFirstPartOrThrowResolver,
    parts: actionResolvers.FindManyPartResolver,
    part: actionResolvers.FindUniquePartResolver,
    getPart: actionResolvers.FindUniquePartOrThrowResolver,
    groupByPart: actionResolvers.GroupByPartResolver,
    updateManyPart: actionResolvers.UpdateManyPartResolver,
    updateOnePart: actionResolvers.UpdateOnePartResolver,
    upsertOnePart: actionResolvers.UpsertOnePartResolver
  },
  PositionData: {
    aggregatePositionData: actionResolvers.AggregatePositionDataResolver,
    createManyPositionData: actionResolvers.CreateManyPositionDataResolver,
    createOnePositionData: actionResolvers.CreateOnePositionDataResolver,
    deleteManyPositionData: actionResolvers.DeleteManyPositionDataResolver,
    deleteOnePositionData: actionResolvers.DeleteOnePositionDataResolver,
    findFirstPositionData: actionResolvers.FindFirstPositionDataResolver,
    findFirstPositionDataOrThrow: actionResolvers.FindFirstPositionDataOrThrowResolver,
    findManyPositionData: actionResolvers.FindManyPositionDataResolver,
    findUniquePositionData: actionResolvers.FindUniquePositionDataResolver,
    findUniquePositionDataOrThrow: actionResolvers.FindUniquePositionDataOrThrowResolver,
    groupByPositionData: actionResolvers.GroupByPositionDataResolver,
    updateManyPositionData: actionResolvers.UpdateManyPositionDataResolver,
    updateOnePositionData: actionResolvers.UpdateOnePositionDataResolver,
    upsertOnePositionData: actionResolvers.UpsertOnePositionDataResolver
  },
  PositionFrame: {
    aggregatePositionFrame: actionResolvers.AggregatePositionFrameResolver,
    createManyPositionFrame: actionResolvers.CreateManyPositionFrameResolver,
    createOnePositionFrame: actionResolvers.CreateOnePositionFrameResolver,
    deleteManyPositionFrame: actionResolvers.DeleteManyPositionFrameResolver,
    deleteOnePositionFrame: actionResolvers.DeleteOnePositionFrameResolver,
    findFirstPositionFrame: actionResolvers.FindFirstPositionFrameResolver,
    findFirstPositionFrameOrThrow: actionResolvers.FindFirstPositionFrameOrThrowResolver,
    positionFrames: actionResolvers.FindManyPositionFrameResolver,
    positionFrame: actionResolvers.FindUniquePositionFrameResolver,
    getPositionFrame: actionResolvers.FindUniquePositionFrameOrThrowResolver,
    groupByPositionFrame: actionResolvers.GroupByPositionFrameResolver,
    updateManyPositionFrame: actionResolvers.UpdateManyPositionFrameResolver,
    updateOnePositionFrame: actionResolvers.UpdateOnePositionFrameResolver,
    upsertOnePositionFrame: actionResolvers.UpsertOnePositionFrameResolver
  },
  ControlData: {
    aggregateControlData: actionResolvers.AggregateControlDataResolver,
    createManyControlData: actionResolvers.CreateManyControlDataResolver,
    createOneControlData: actionResolvers.CreateOneControlDataResolver,
    deleteManyControlData: actionResolvers.DeleteManyControlDataResolver,
    deleteOneControlData: actionResolvers.DeleteOneControlDataResolver,
    findFirstControlData: actionResolvers.FindFirstControlDataResolver,
    findFirstControlDataOrThrow: actionResolvers.FindFirstControlDataOrThrowResolver,
    findManyControlData: actionResolvers.FindManyControlDataResolver,
    findUniqueControlData: actionResolvers.FindUniqueControlDataResolver,
    findUniqueControlDataOrThrow: actionResolvers.FindUniqueControlDataOrThrowResolver,
    groupByControlData: actionResolvers.GroupByControlDataResolver,
    updateManyControlData: actionResolvers.UpdateManyControlDataResolver,
    updateOneControlData: actionResolvers.UpdateOneControlDataResolver,
    upsertOneControlData: actionResolvers.UpsertOneControlDataResolver
  },
  ControlFrame: {
    aggregateControlFrame: actionResolvers.AggregateControlFrameResolver,
    createManyControlFrame: actionResolvers.CreateManyControlFrameResolver,
    createOneControlFrame: actionResolvers.CreateOneControlFrameResolver,
    deleteManyControlFrame: actionResolvers.DeleteManyControlFrameResolver,
    deleteOneControlFrame: actionResolvers.DeleteOneControlFrameResolver,
    findFirstControlFrame: actionResolvers.FindFirstControlFrameResolver,
    findFirstControlFrameOrThrow: actionResolvers.FindFirstControlFrameOrThrowResolver,
    controlFrames: actionResolvers.FindManyControlFrameResolver,
    controlFrame: actionResolvers.FindUniqueControlFrameResolver,
    getControlFrame: actionResolvers.FindUniqueControlFrameOrThrowResolver,
    groupByControlFrame: actionResolvers.GroupByControlFrameResolver,
    updateManyControlFrame: actionResolvers.UpdateManyControlFrameResolver,
    updateOneControlFrame: actionResolvers.UpdateOneControlFrameResolver,
    upsertOneControlFrame: actionResolvers.UpsertOneControlFrameResolver
  },
  EffectListData: {
    aggregateEffectListData: actionResolvers.AggregateEffectListDataResolver,
    createManyEffectListData: actionResolvers.CreateManyEffectListDataResolver,
    createOneEffectListData: actionResolvers.CreateOneEffectListDataResolver,
    deleteManyEffectListData: actionResolvers.DeleteManyEffectListDataResolver,
    deleteOneEffectListData: actionResolvers.DeleteOneEffectListDataResolver,
    findFirstEffectListData: actionResolvers.FindFirstEffectListDataResolver,
    findFirstEffectListDataOrThrow: actionResolvers.FindFirstEffectListDataOrThrowResolver,
    findManyEffectListData: actionResolvers.FindManyEffectListDataResolver,
    findUniqueEffectListData: actionResolvers.FindUniqueEffectListDataResolver,
    findUniqueEffectListDataOrThrow: actionResolvers.FindUniqueEffectListDataOrThrowResolver,
    groupByEffectListData: actionResolvers.GroupByEffectListDataResolver,
    updateManyEffectListData: actionResolvers.UpdateManyEffectListDataResolver,
    updateOneEffectListData: actionResolvers.UpdateOneEffectListDataResolver,
    upsertOneEffectListData: actionResolvers.UpsertOneEffectListDataResolver
  },
  Logger: {
    aggregateLogger: actionResolvers.AggregateLoggerResolver,
    createManyLogger: actionResolvers.CreateManyLoggerResolver,
    createOneLogger: actionResolvers.CreateOneLoggerResolver,
    deleteManyLogger: actionResolvers.DeleteManyLoggerResolver,
    deleteOneLogger: actionResolvers.DeleteOneLoggerResolver,
    findFirstLogger: actionResolvers.FindFirstLoggerResolver,
    findFirstLoggerOrThrow: actionResolvers.FindFirstLoggerOrThrowResolver,
    loggers: actionResolvers.FindManyLoggerResolver,
    logger: actionResolvers.FindUniqueLoggerResolver,
    getLogger: actionResolvers.FindUniqueLoggerOrThrowResolver,
    groupByLogger: actionResolvers.GroupByLoggerResolver,
    updateManyLogger: actionResolvers.UpdateManyLoggerResolver,
    updateOneLogger: actionResolvers.UpdateOneLoggerResolver,
    upsertOneLogger: actionResolvers.UpsertOneLoggerResolver
  }
};
const crudResolversInfo = {
  Color: ["aggregateColor", "createManyColor", "createOneColor", "deleteManyColor", "deleteOneColor", "findFirstColor", "findFirstColorOrThrow", "colors", "color", "getColor", "groupByColor", "updateManyColor", "updateOneColor", "upsertOneColor"],
  LEDEffect: ["aggregateLEDEffect", "createManyLEDEffect", "createOneLEDEffect", "deleteManyLEDEffect", "deleteOneLEDEffect", "findFirstLEDEffect", "findFirstLEDEffectOrThrow", "lEDEffects", "lEDEffect", "getLEDEffect", "groupByLEDEffect", "updateManyLEDEffect", "updateOneLEDEffect", "upsertOneLEDEffect"],
  User: ["aggregateUser", "createManyUser", "createOneUser", "deleteManyUser", "deleteOneUser", "findFirstUser", "findFirstUserOrThrow", "users", "user", "getUser", "groupByUser", "updateManyUser", "updateOneUser", "upsertOneUser"],
  EditingPositionFrame: ["aggregateEditingPositionFrame", "createManyEditingPositionFrame", "createOneEditingPositionFrame", "deleteManyEditingPositionFrame", "deleteOneEditingPositionFrame", "findFirstEditingPositionFrame", "findFirstEditingPositionFrameOrThrow", "editingPositionFrames", "editingPositionFrame", "getEditingPositionFrame", "groupByEditingPositionFrame", "updateManyEditingPositionFrame", "updateOneEditingPositionFrame", "upsertOneEditingPositionFrame"],
  EditingControlFrame: ["aggregateEditingControlFrame", "createManyEditingControlFrame", "createOneEditingControlFrame", "deleteManyEditingControlFrame", "deleteOneEditingControlFrame", "findFirstEditingControlFrame", "findFirstEditingControlFrameOrThrow", "editingControlFrames", "editingControlFrame", "getEditingControlFrame", "groupByEditingControlFrame", "updateManyEditingControlFrame", "updateOneEditingControlFrame", "upsertOneEditingControlFrame"],
  Dancer: ["aggregateDancer", "createManyDancer", "createOneDancer", "deleteManyDancer", "deleteOneDancer", "findFirstDancer", "findFirstDancerOrThrow", "dancers", "dancer", "getDancer", "groupByDancer", "updateManyDancer", "updateOneDancer", "upsertOneDancer"],
  Part: ["aggregatePart", "createManyPart", "createOnePart", "deleteManyPart", "deleteOnePart", "findFirstPart", "findFirstPartOrThrow", "parts", "part", "getPart", "groupByPart", "updateManyPart", "updateOnePart", "upsertOnePart"],
  PositionData: ["aggregatePositionData", "createManyPositionData", "createOnePositionData", "deleteManyPositionData", "deleteOnePositionData", "findFirstPositionData", "findFirstPositionDataOrThrow", "findManyPositionData", "findUniquePositionData", "findUniquePositionDataOrThrow", "groupByPositionData", "updateManyPositionData", "updateOnePositionData", "upsertOnePositionData"],
  PositionFrame: ["aggregatePositionFrame", "createManyPositionFrame", "createOnePositionFrame", "deleteManyPositionFrame", "deleteOnePositionFrame", "findFirstPositionFrame", "findFirstPositionFrameOrThrow", "positionFrames", "positionFrame", "getPositionFrame", "groupByPositionFrame", "updateManyPositionFrame", "updateOnePositionFrame", "upsertOnePositionFrame"],
  ControlData: ["aggregateControlData", "createManyControlData", "createOneControlData", "deleteManyControlData", "deleteOneControlData", "findFirstControlData", "findFirstControlDataOrThrow", "findManyControlData", "findUniqueControlData", "findUniqueControlDataOrThrow", "groupByControlData", "updateManyControlData", "updateOneControlData", "upsertOneControlData"],
  ControlFrame: ["aggregateControlFrame", "createManyControlFrame", "createOneControlFrame", "deleteManyControlFrame", "deleteOneControlFrame", "findFirstControlFrame", "findFirstControlFrameOrThrow", "controlFrames", "controlFrame", "getControlFrame", "groupByControlFrame", "updateManyControlFrame", "updateOneControlFrame", "upsertOneControlFrame"],
  EffectListData: ["aggregateEffectListData", "createManyEffectListData", "createOneEffectListData", "deleteManyEffectListData", "deleteOneEffectListData", "findFirstEffectListData", "findFirstEffectListDataOrThrow", "findManyEffectListData", "findUniqueEffectListData", "findUniqueEffectListDataOrThrow", "groupByEffectListData", "updateManyEffectListData", "updateOneEffectListData", "upsertOneEffectListData"],
  Logger: ["aggregateLogger", "createManyLogger", "createOneLogger", "deleteManyLogger", "deleteOneLogger", "findFirstLogger", "findFirstLoggerOrThrow", "loggers", "logger", "getLogger", "groupByLogger", "updateManyLogger", "updateOneLogger", "upsertOneLogger"]
};
const argsInfo = {
  AggregateColorArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyColorArgs: ["data", "skipDuplicates"],
  CreateOneColorArgs: ["data"],
  DeleteManyColorArgs: ["where"],
  DeleteOneColorArgs: ["where"],
  FindFirstColorArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstColorOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyColorArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueColorArgs: ["where"],
  FindUniqueColorOrThrowArgs: ["where"],
  GroupByColorArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyColorArgs: ["data", "where"],
  UpdateOneColorArgs: ["data", "where"],
  UpsertOneColorArgs: ["where", "create", "update"],
  AggregateLEDEffectArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyLEDEffectArgs: ["data", "skipDuplicates"],
  CreateOneLEDEffectArgs: ["data"],
  DeleteManyLEDEffectArgs: ["where"],
  DeleteOneLEDEffectArgs: ["where"],
  FindFirstLEDEffectArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstLEDEffectOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyLEDEffectArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueLEDEffectArgs: ["where"],
  FindUniqueLEDEffectOrThrowArgs: ["where"],
  GroupByLEDEffectArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyLEDEffectArgs: ["data", "where"],
  UpdateOneLEDEffectArgs: ["data", "where"],
  UpsertOneLEDEffectArgs: ["where", "create", "update"],
  AggregateUserArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyUserArgs: ["data", "skipDuplicates"],
  CreateOneUserArgs: ["data"],
  DeleteManyUserArgs: ["where"],
  DeleteOneUserArgs: ["where"],
  FindFirstUserArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstUserOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyUserArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueUserArgs: ["where"],
  FindUniqueUserOrThrowArgs: ["where"],
  GroupByUserArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyUserArgs: ["data", "where"],
  UpdateOneUserArgs: ["data", "where"],
  UpsertOneUserArgs: ["where", "create", "update"],
  AggregateEditingPositionFrameArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyEditingPositionFrameArgs: ["data", "skipDuplicates"],
  CreateOneEditingPositionFrameArgs: ["data"],
  DeleteManyEditingPositionFrameArgs: ["where"],
  DeleteOneEditingPositionFrameArgs: ["where"],
  FindFirstEditingPositionFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstEditingPositionFrameOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyEditingPositionFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueEditingPositionFrameArgs: ["where"],
  FindUniqueEditingPositionFrameOrThrowArgs: ["where"],
  GroupByEditingPositionFrameArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyEditingPositionFrameArgs: ["data", "where"],
  UpdateOneEditingPositionFrameArgs: ["data", "where"],
  UpsertOneEditingPositionFrameArgs: ["where", "create", "update"],
  AggregateEditingControlFrameArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyEditingControlFrameArgs: ["data", "skipDuplicates"],
  CreateOneEditingControlFrameArgs: ["data"],
  DeleteManyEditingControlFrameArgs: ["where"],
  DeleteOneEditingControlFrameArgs: ["where"],
  FindFirstEditingControlFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstEditingControlFrameOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyEditingControlFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueEditingControlFrameArgs: ["where"],
  FindUniqueEditingControlFrameOrThrowArgs: ["where"],
  GroupByEditingControlFrameArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyEditingControlFrameArgs: ["data", "where"],
  UpdateOneEditingControlFrameArgs: ["data", "where"],
  UpsertOneEditingControlFrameArgs: ["where", "create", "update"],
  AggregateDancerArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyDancerArgs: ["data", "skipDuplicates"],
  CreateOneDancerArgs: ["data"],
  DeleteManyDancerArgs: ["where"],
  DeleteOneDancerArgs: ["where"],
  FindFirstDancerArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstDancerOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyDancerArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueDancerArgs: ["where"],
  FindUniqueDancerOrThrowArgs: ["where"],
  GroupByDancerArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyDancerArgs: ["data", "where"],
  UpdateOneDancerArgs: ["data", "where"],
  UpsertOneDancerArgs: ["where", "create", "update"],
  AggregatePartArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyPartArgs: ["data", "skipDuplicates"],
  CreateOnePartArgs: ["data"],
  DeleteManyPartArgs: ["where"],
  DeleteOnePartArgs: ["where"],
  FindFirstPartArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstPartOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyPartArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniquePartArgs: ["where"],
  FindUniquePartOrThrowArgs: ["where"],
  GroupByPartArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyPartArgs: ["data", "where"],
  UpdateOnePartArgs: ["data", "where"],
  UpsertOnePartArgs: ["where", "create", "update"],
  AggregatePositionDataArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyPositionDataArgs: ["data", "skipDuplicates"],
  CreateOnePositionDataArgs: ["data"],
  DeleteManyPositionDataArgs: ["where"],
  DeleteOnePositionDataArgs: ["where"],
  FindFirstPositionDataArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstPositionDataOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyPositionDataArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniquePositionDataArgs: ["where"],
  FindUniquePositionDataOrThrowArgs: ["where"],
  GroupByPositionDataArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyPositionDataArgs: ["data", "where"],
  UpdateOnePositionDataArgs: ["data", "where"],
  UpsertOnePositionDataArgs: ["where", "create", "update"],
  AggregatePositionFrameArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyPositionFrameArgs: ["data", "skipDuplicates"],
  CreateOnePositionFrameArgs: ["data"],
  DeleteManyPositionFrameArgs: ["where"],
  DeleteOnePositionFrameArgs: ["where"],
  FindFirstPositionFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstPositionFrameOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyPositionFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniquePositionFrameArgs: ["where"],
  FindUniquePositionFrameOrThrowArgs: ["where"],
  GroupByPositionFrameArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyPositionFrameArgs: ["data", "where"],
  UpdateOnePositionFrameArgs: ["data", "where"],
  UpsertOnePositionFrameArgs: ["where", "create", "update"],
  AggregateControlDataArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyControlDataArgs: ["data", "skipDuplicates"],
  CreateOneControlDataArgs: ["data"],
  DeleteManyControlDataArgs: ["where"],
  DeleteOneControlDataArgs: ["where"],
  FindFirstControlDataArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstControlDataOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyControlDataArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueControlDataArgs: ["where"],
  FindUniqueControlDataOrThrowArgs: ["where"],
  GroupByControlDataArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyControlDataArgs: ["data", "where"],
  UpdateOneControlDataArgs: ["data", "where"],
  UpsertOneControlDataArgs: ["where", "create", "update"],
  AggregateControlFrameArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyControlFrameArgs: ["data", "skipDuplicates"],
  CreateOneControlFrameArgs: ["data"],
  DeleteManyControlFrameArgs: ["where"],
  DeleteOneControlFrameArgs: ["where"],
  FindFirstControlFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstControlFrameOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyControlFrameArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueControlFrameArgs: ["where"],
  FindUniqueControlFrameOrThrowArgs: ["where"],
  GroupByControlFrameArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyControlFrameArgs: ["data", "where"],
  UpdateOneControlFrameArgs: ["data", "where"],
  UpsertOneControlFrameArgs: ["where", "create", "update"],
  AggregateEffectListDataArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyEffectListDataArgs: ["data", "skipDuplicates"],
  CreateOneEffectListDataArgs: ["data"],
  DeleteManyEffectListDataArgs: ["where"],
  DeleteOneEffectListDataArgs: ["where"],
  FindFirstEffectListDataArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstEffectListDataOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyEffectListDataArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueEffectListDataArgs: ["where"],
  FindUniqueEffectListDataOrThrowArgs: ["where"],
  GroupByEffectListDataArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyEffectListDataArgs: ["data", "where"],
  UpdateOneEffectListDataArgs: ["data", "where"],
  UpsertOneEffectListDataArgs: ["where", "create", "update"],
  AggregateLoggerArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyLoggerArgs: ["data", "skipDuplicates"],
  CreateOneLoggerArgs: ["data"],
  DeleteManyLoggerArgs: ["where"],
  DeleteOneLoggerArgs: ["where"],
  FindFirstLoggerArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstLoggerOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyLoggerArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueLoggerArgs: ["where"],
  FindUniqueLoggerOrThrowArgs: ["where"],
  GroupByLoggerArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyLoggerArgs: ["data", "where"],
  UpdateOneLoggerArgs: ["data", "where"],
  UpsertOneLoggerArgs: ["where", "create", "update"]
};

type ResolverModelNames = keyof typeof crudResolversMap;

type ModelResolverActionNames<
  TModel extends ResolverModelNames
> = keyof typeof crudResolversMap[TModel]["prototype"];

export type ResolverActionsConfig<
  TModel extends ResolverModelNames
> = Partial<Record<ModelResolverActionNames<TModel> | "_all", MethodDecorator[]>>;

export type ResolversEnhanceMap = {
  [TModel in ResolverModelNames]?: ResolverActionsConfig<TModel>;
};

export function applyResolversEnhanceMap(
  resolversEnhanceMap: ResolversEnhanceMap,
) {
  for (const resolversEnhanceMapKey of Object.keys(resolversEnhanceMap)) {
    const modelName = resolversEnhanceMapKey as keyof typeof resolversEnhanceMap;
    const crudTarget = crudResolversMap[modelName].prototype;
    const resolverActionsConfig = resolversEnhanceMap[modelName]!;
    const actionResolversConfig = actionResolversMap[modelName];
    if (resolverActionsConfig._all) {
      const allActionsDecorators = resolverActionsConfig._all;
      const resolverActionNames = crudResolversInfo[modelName as keyof typeof crudResolversInfo];
      for (const resolverActionName of resolverActionNames) {
        const actionTarget = (actionResolversConfig[
          resolverActionName as keyof typeof actionResolversConfig
        ] as Function).prototype;
        tslib.__decorate(allActionsDecorators, crudTarget, resolverActionName, null);
        tslib.__decorate(allActionsDecorators, actionTarget, resolverActionName, null);
      }
    }
    const resolverActionsToApply = Object.keys(resolverActionsConfig).filter(
      it => it !== "_all"
    );
    for (const resolverActionName of resolverActionsToApply) {
      const decorators = resolverActionsConfig[
        resolverActionName as keyof typeof resolverActionsConfig
      ] as MethodDecorator[];
      const actionTarget = (actionResolversConfig[
        resolverActionName as keyof typeof actionResolversConfig
      ] as Function).prototype;
      tslib.__decorate(decorators, crudTarget, resolverActionName, null);
      tslib.__decorate(decorators, actionTarget, resolverActionName, null);
    }
  }
}

type ArgsTypesNames = keyof typeof argsTypes;

type ArgFieldNames<TArgsType extends ArgsTypesNames> = Exclude<
  keyof typeof argsTypes[TArgsType]["prototype"],
  number | symbol
>;

type ArgFieldsConfig<
  TArgsType extends ArgsTypesNames
> = FieldsConfig<ArgFieldNames<TArgsType>>;

export type ArgConfig<TArgsType extends ArgsTypesNames> = {
  class?: ClassDecorator[];
  fields?: ArgFieldsConfig<TArgsType>;
};

export type ArgsTypesEnhanceMap = {
  [TArgsType in ArgsTypesNames]?: ArgConfig<TArgsType>;
};

export function applyArgsTypesEnhanceMap(
  argsTypesEnhanceMap: ArgsTypesEnhanceMap,
) {
  for (const argsTypesEnhanceMapKey of Object.keys(argsTypesEnhanceMap)) {
    const argsTypeName = argsTypesEnhanceMapKey as keyof typeof argsTypesEnhanceMap;
    const typeConfig = argsTypesEnhanceMap[argsTypeName]!;
    const typeClass = argsTypes[argsTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      argsInfo[argsTypeName as keyof typeof argsInfo],
    );
  }
}

const relationResolversMap = {
  User: relationResolvers.UserRelationsResolver,
  EditingPositionFrame: relationResolvers.EditingPositionFrameRelationsResolver,
  EditingControlFrame: relationResolvers.EditingControlFrameRelationsResolver,
  Dancer: relationResolvers.DancerRelationsResolver,
  Part: relationResolvers.PartRelationsResolver,
  PositionData: relationResolvers.PositionDataRelationsResolver,
  PositionFrame: relationResolvers.PositionFrameRelationsResolver,
  ControlData: relationResolvers.ControlDataRelationsResolver,
  ControlFrame: relationResolvers.ControlFrameRelationsResolver
};
const relationResolversInfo = {
  User: ["editingPositionFrameId", "editingControlFrameId"],
  EditingPositionFrame: ["user", "editingFrame"],
  EditingControlFrame: ["user", "editingFrame"],
  Dancer: ["parts", "positionData"],
  Part: ["dancer", "controlData"],
  PositionData: ["dancer", "frame"],
  PositionFrame: ["editing", "positionDatas"],
  ControlData: ["part", "frame"],
  ControlFrame: ["editing", "controlDatas"]
};

type RelationResolverModelNames = keyof typeof relationResolversMap;

type RelationResolverActionNames<
  TModel extends RelationResolverModelNames
> = keyof typeof relationResolversMap[TModel]["prototype"];

export type RelationResolverActionsConfig<TModel extends RelationResolverModelNames>
  = Partial<Record<RelationResolverActionNames<TModel> | "_all", MethodDecorator[]>>;

export type RelationResolversEnhanceMap = {
  [TModel in RelationResolverModelNames]?: RelationResolverActionsConfig<TModel>;
};

export function applyRelationResolversEnhanceMap(
  relationResolversEnhanceMap: RelationResolversEnhanceMap,
) {
  for (const relationResolversEnhanceMapKey of Object.keys(relationResolversEnhanceMap)) {
    const modelName = relationResolversEnhanceMapKey as keyof typeof relationResolversEnhanceMap;
    const relationResolverTarget = relationResolversMap[modelName].prototype;
    const relationResolverActionsConfig = relationResolversEnhanceMap[modelName]!;
    if (relationResolverActionsConfig._all) {
      const allActionsDecorators = relationResolverActionsConfig._all;
      const relationResolverActionNames = relationResolversInfo[modelName as keyof typeof relationResolversInfo];
      for (const relationResolverActionName of relationResolverActionNames) {
        tslib.__decorate(allActionsDecorators, relationResolverTarget, relationResolverActionName, null);
      }
    }
    const relationResolverActionsToApply = Object.keys(relationResolverActionsConfig).filter(
      it => it !== "_all"
    );
    for (const relationResolverActionName of relationResolverActionsToApply) {
      const decorators = relationResolverActionsConfig[
        relationResolverActionName as keyof typeof relationResolverActionsConfig
      ] as MethodDecorator[];
      tslib.__decorate(decorators, relationResolverTarget, relationResolverActionName, null);
    }
  }
}

type TypeConfig = {
  class?: ClassDecorator[];
  fields?: FieldsConfig;
};

type FieldsConfig<TTypeKeys extends string = string> = Partial<
  Record<TTypeKeys | "_all", PropertyDecorator[]>
>;

function applyTypeClassEnhanceConfig<
  TEnhanceConfig extends TypeConfig,
  TType extends object
>(
  enhanceConfig: TEnhanceConfig,
  typeClass: ClassType<TType>,
  typePrototype: TType,
  typeFieldNames: string[]
) {
  if (enhanceConfig.class) {
    tslib.__decorate(enhanceConfig.class, typeClass);
  }
  if (enhanceConfig.fields) {
    if (enhanceConfig.fields._all) {
      const allFieldsDecorators = enhanceConfig.fields._all;
      for (const typeFieldName of typeFieldNames) {
        tslib.__decorate(allFieldsDecorators, typePrototype, typeFieldName, void 0);
      }
    }
    const configFieldsToApply = Object.keys(enhanceConfig.fields).filter(
      it => it !== "_all"
    );
    for (const typeFieldName of configFieldsToApply) {
      const fieldDecorators = enhanceConfig.fields[typeFieldName]!;
      tslib.__decorate(fieldDecorators, typePrototype, typeFieldName, void 0);
    }
  }
}

const modelsInfo = {
  Color: ["color", "colorCode"],
  LEDEffect: ["id", "name", "partName", "repeat", "frames"],
  User: ["id", "name", "password"],
  EditingPositionFrame: ["userId", "frameId"],
  EditingControlFrame: ["userId", "frameId"],
  Dancer: ["id", "name"],
  Part: ["id", "dancerId", "name", "type"],
  PositionData: ["dancerId", "frameId", "x", "y", "z"],
  PositionFrame: ["id", "start"],
  ControlData: ["partId", "frameId", "value"],
  ControlFrame: ["id", "start", "fade"],
  EffectListData: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  Logger: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"]
};

type ModelNames = keyof typeof models;

type ModelFieldNames<TModel extends ModelNames> = Exclude<
  keyof typeof models[TModel]["prototype"],
  number | symbol
>;

type ModelFieldsConfig<TModel extends ModelNames> = FieldsConfig<
  ModelFieldNames<TModel>
>;

export type ModelConfig<TModel extends ModelNames> = {
  class?: ClassDecorator[];
  fields?: ModelFieldsConfig<TModel>;
};

export type ModelsEnhanceMap = {
  [TModel in ModelNames]?: ModelConfig<TModel>;
};

export function applyModelsEnhanceMap(modelsEnhanceMap: ModelsEnhanceMap) {
  for (const modelsEnhanceMapKey of Object.keys(modelsEnhanceMap)) {
    const modelName = modelsEnhanceMapKey as keyof typeof modelsEnhanceMap;
    const modelConfig = modelsEnhanceMap[modelName]!;
    const modelClass = models[modelName];
    const modelTarget = modelClass.prototype;
    applyTypeClassEnhanceConfig(
      modelConfig,
      modelClass,
      modelTarget,
      modelsInfo[modelName as keyof typeof modelsInfo],
    );
  }
}

const outputsInfo = {
  AggregateColor: ["_count", "_min", "_max"],
  ColorGroupBy: ["color", "colorCode", "_count", "_min", "_max"],
  AggregateLEDEffect: ["_count", "_avg", "_sum", "_min", "_max"],
  LEDEffectGroupBy: ["id", "name", "partName", "repeat", "frames", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateUser: ["_count", "_avg", "_sum", "_min", "_max"],
  UserGroupBy: ["id", "name", "password", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateEditingPositionFrame: ["_count", "_avg", "_sum", "_min", "_max"],
  EditingPositionFrameGroupBy: ["userId", "frameId", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateEditingControlFrame: ["_count", "_avg", "_sum", "_min", "_max"],
  EditingControlFrameGroupBy: ["userId", "frameId", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateDancer: ["_count", "_avg", "_sum", "_min", "_max"],
  DancerGroupBy: ["id", "name", "_count", "_avg", "_sum", "_min", "_max"],
  AggregatePart: ["_count", "_avg", "_sum", "_min", "_max"],
  PartGroupBy: ["id", "dancerId", "name", "type", "_count", "_avg", "_sum", "_min", "_max"],
  AggregatePositionData: ["_count", "_avg", "_sum", "_min", "_max"],
  PositionDataGroupBy: ["dancerId", "frameId", "x", "y", "z", "_count", "_avg", "_sum", "_min", "_max"],
  AggregatePositionFrame: ["_count", "_avg", "_sum", "_min", "_max"],
  PositionFrameGroupBy: ["id", "start", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateControlData: ["_count", "_avg", "_sum", "_min", "_max"],
  ControlDataGroupBy: ["partId", "frameId", "value", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateControlFrame: ["_count", "_avg", "_sum", "_min", "_max"],
  ControlFrameGroupBy: ["id", "start", "fade", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateEffectListData: ["_count", "_avg", "_sum", "_min", "_max"],
  EffectListDataGroupBy: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateLogger: ["_count", "_avg", "_sum", "_min", "_max"],
  LoggerGroupBy: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result", "_count", "_avg", "_sum", "_min", "_max"],
  AffectedRowsOutput: ["count"],
  ColorCountAggregate: ["color", "colorCode", "_all"],
  ColorMinAggregate: ["color", "colorCode"],
  ColorMaxAggregate: ["color", "colorCode"],
  LEDEffectCountAggregate: ["id", "name", "partName", "repeat", "frames", "_all"],
  LEDEffectAvgAggregate: ["id", "repeat"],
  LEDEffectSumAggregate: ["id", "repeat"],
  LEDEffectMinAggregate: ["id", "name", "partName", "repeat"],
  LEDEffectMaxAggregate: ["id", "name", "partName", "repeat"],
  UserCountAggregate: ["id", "name", "password", "_all"],
  UserAvgAggregate: ["id"],
  UserSumAggregate: ["id"],
  UserMinAggregate: ["id", "name", "password"],
  UserMaxAggregate: ["id", "name", "password"],
  EditingPositionFrameCountAggregate: ["userId", "frameId", "_all"],
  EditingPositionFrameAvgAggregate: ["userId", "frameId"],
  EditingPositionFrameSumAggregate: ["userId", "frameId"],
  EditingPositionFrameMinAggregate: ["userId", "frameId"],
  EditingPositionFrameMaxAggregate: ["userId", "frameId"],
  EditingControlFrameCountAggregate: ["userId", "frameId", "_all"],
  EditingControlFrameAvgAggregate: ["userId", "frameId"],
  EditingControlFrameSumAggregate: ["userId", "frameId"],
  EditingControlFrameMinAggregate: ["userId", "frameId"],
  EditingControlFrameMaxAggregate: ["userId", "frameId"],
  DancerCount: ["parts", "positionData"],
  DancerCountAggregate: ["id", "name", "_all"],
  DancerAvgAggregate: ["id"],
  DancerSumAggregate: ["id"],
  DancerMinAggregate: ["id", "name"],
  DancerMaxAggregate: ["id", "name"],
  PartCount: ["controlData"],
  PartCountAggregate: ["id", "dancerId", "name", "type", "_all"],
  PartAvgAggregate: ["id", "dancerId"],
  PartSumAggregate: ["id", "dancerId"],
  PartMinAggregate: ["id", "dancerId", "name", "type"],
  PartMaxAggregate: ["id", "dancerId", "name", "type"],
  PositionDataCountAggregate: ["dancerId", "frameId", "x", "y", "z", "_all"],
  PositionDataAvgAggregate: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataSumAggregate: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataMinAggregate: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataMaxAggregate: ["dancerId", "frameId", "x", "y", "z"],
  PositionFrameCount: ["positionDatas"],
  PositionFrameCountAggregate: ["id", "start", "_all"],
  PositionFrameAvgAggregate: ["id", "start"],
  PositionFrameSumAggregate: ["id", "start"],
  PositionFrameMinAggregate: ["id", "start"],
  PositionFrameMaxAggregate: ["id", "start"],
  ControlDataCountAggregate: ["partId", "frameId", "value", "_all"],
  ControlDataAvgAggregate: ["partId", "frameId"],
  ControlDataSumAggregate: ["partId", "frameId"],
  ControlDataMinAggregate: ["partId", "frameId"],
  ControlDataMaxAggregate: ["partId", "frameId"],
  ControlFrameCount: ["controlDatas"],
  ControlFrameCountAggregate: ["id", "start", "fade", "_all"],
  ControlFrameAvgAggregate: ["id", "start"],
  ControlFrameSumAggregate: ["id", "start"],
  ControlFrameMinAggregate: ["id", "start", "fade"],
  ControlFrameMaxAggregate: ["id", "start", "fade"],
  EffectListDataCountAggregate: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames", "_all"],
  EffectListDataAvgAggregate: ["id", "start", "end"],
  EffectListDataSumAggregate: ["id", "start", "end"],
  EffectListDataMinAggregate: ["id", "start", "end", "description"],
  EffectListDataMaxAggregate: ["id", "start", "end", "description"],
  LoggerCountAggregate: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result", "_all"],
  LoggerAvgAggregate: ["id"],
  LoggerSumAggregate: ["id"],
  LoggerMinAggregate: ["id", "user", "fieldName", "time", "status"],
  LoggerMaxAggregate: ["id", "user", "fieldName", "time", "status"]
};

type OutputTypesNames = keyof typeof outputTypes;

type OutputTypeFieldNames<TOutput extends OutputTypesNames> = Exclude<
  keyof typeof outputTypes[TOutput]["prototype"],
  number | symbol
>;

type OutputTypeFieldsConfig<
  TOutput extends OutputTypesNames
> = FieldsConfig<OutputTypeFieldNames<TOutput>>;

export type OutputTypeConfig<TOutput extends OutputTypesNames> = {
  class?: ClassDecorator[];
  fields?: OutputTypeFieldsConfig<TOutput>;
};

export type OutputTypesEnhanceMap = {
  [TOutput in OutputTypesNames]?: OutputTypeConfig<TOutput>;
};

export function applyOutputTypesEnhanceMap(
  outputTypesEnhanceMap: OutputTypesEnhanceMap,
) {
  for (const outputTypeEnhanceMapKey of Object.keys(outputTypesEnhanceMap)) {
    const outputTypeName = outputTypeEnhanceMapKey as keyof typeof outputTypesEnhanceMap;
    const typeConfig = outputTypesEnhanceMap[outputTypeName]!;
    const typeClass = outputTypes[outputTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      outputsInfo[outputTypeName as keyof typeof outputsInfo],
    );
  }
}

const inputsInfo = {
  ColorWhereInput: ["AND", "OR", "NOT", "color", "colorCode"],
  ColorOrderByWithRelationInput: ["color", "colorCode"],
  ColorWhereUniqueInput: ["color"],
  ColorOrderByWithAggregationInput: ["color", "colorCode", "_count", "_max", "_min"],
  ColorScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "color", "colorCode"],
  LEDEffectWhereInput: ["AND", "OR", "NOT", "id", "name", "partName", "repeat", "frames"],
  LEDEffectOrderByWithRelationInput: ["id", "name", "partName", "repeat", "frames"],
  LEDEffectWhereUniqueInput: ["id", "name_partName"],
  LEDEffectOrderByWithAggregationInput: ["id", "name", "partName", "repeat", "frames", "_count", "_avg", "_max", "_min", "_sum"],
  LEDEffectScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "name", "partName", "repeat", "frames"],
  UserWhereInput: ["AND", "OR", "NOT", "id", "name", "password", "editingPositionFrameId", "editingControlFrameId"],
  UserOrderByWithRelationInput: ["id", "name", "password", "editingPositionFrameId", "editingControlFrameId"],
  UserWhereUniqueInput: ["id", "name"],
  UserOrderByWithAggregationInput: ["id", "name", "password", "_count", "_avg", "_max", "_min", "_sum"],
  UserScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "name", "password"],
  EditingPositionFrameWhereInput: ["AND", "OR", "NOT", "userId", "frameId", "user", "editingFrame"],
  EditingPositionFrameOrderByWithRelationInput: ["userId", "frameId", "user", "editingFrame"],
  EditingPositionFrameWhereUniqueInput: ["userId", "frameId"],
  EditingPositionFrameOrderByWithAggregationInput: ["userId", "frameId", "_count", "_avg", "_max", "_min", "_sum"],
  EditingPositionFrameScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "userId", "frameId"],
  EditingControlFrameWhereInput: ["AND", "OR", "NOT", "userId", "frameId", "user", "editingFrame"],
  EditingControlFrameOrderByWithRelationInput: ["userId", "frameId", "user", "editingFrame"],
  EditingControlFrameWhereUniqueInput: ["userId", "frameId"],
  EditingControlFrameOrderByWithAggregationInput: ["userId", "frameId", "_count", "_avg", "_max", "_min", "_sum"],
  EditingControlFrameScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "userId", "frameId"],
  DancerWhereInput: ["AND", "OR", "NOT", "id", "name", "parts", "positionData"],
  DancerOrderByWithRelationInput: ["id", "name", "parts", "positionData"],
  DancerWhereUniqueInput: ["id"],
  DancerOrderByWithAggregationInput: ["id", "name", "_count", "_avg", "_max", "_min", "_sum"],
  DancerScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "name"],
  PartWhereInput: ["AND", "OR", "NOT", "id", "dancerId", "name", "type", "dancer", "controlData"],
  PartOrderByWithRelationInput: ["id", "dancerId", "name", "type", "dancer", "controlData"],
  PartWhereUniqueInput: ["id"],
  PartOrderByWithAggregationInput: ["id", "dancerId", "name", "type", "_count", "_avg", "_max", "_min", "_sum"],
  PartScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "dancerId", "name", "type"],
  PositionDataWhereInput: ["AND", "OR", "NOT", "dancerId", "frameId", "x", "y", "z", "dancer", "frame"],
  PositionDataOrderByWithRelationInput: ["dancerId", "frameId", "x", "y", "z", "dancer", "frame"],
  PositionDataWhereUniqueInput: ["dancerId_frameId"],
  PositionDataOrderByWithAggregationInput: ["dancerId", "frameId", "x", "y", "z", "_count", "_avg", "_max", "_min", "_sum"],
  PositionDataScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "dancerId", "frameId", "x", "y", "z"],
  PositionFrameWhereInput: ["AND", "OR", "NOT", "id", "start", "editing", "positionDatas"],
  PositionFrameOrderByWithRelationInput: ["id", "start", "editing", "positionDatas"],
  PositionFrameWhereUniqueInput: ["id", "start"],
  PositionFrameOrderByWithAggregationInput: ["id", "start", "_count", "_avg", "_max", "_min", "_sum"],
  PositionFrameScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "start"],
  ControlDataWhereInput: ["AND", "OR", "NOT", "partId", "frameId", "value", "part", "frame"],
  ControlDataOrderByWithRelationInput: ["partId", "frameId", "value", "part", "frame"],
  ControlDataWhereUniqueInput: ["partId_frameId"],
  ControlDataOrderByWithAggregationInput: ["partId", "frameId", "value", "_count", "_avg", "_max", "_min", "_sum"],
  ControlDataScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "partId", "frameId", "value"],
  ControlFrameWhereInput: ["AND", "OR", "NOT", "id", "start", "fade", "editing", "controlDatas"],
  ControlFrameOrderByWithRelationInput: ["id", "start", "fade", "editing", "controlDatas"],
  ControlFrameWhereUniqueInput: ["id", "start"],
  ControlFrameOrderByWithAggregationInput: ["id", "start", "fade", "_count", "_avg", "_max", "_min", "_sum"],
  ControlFrameScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "start", "fade"],
  EffectListDataWhereInput: ["AND", "OR", "NOT", "id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  EffectListDataOrderByWithRelationInput: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  EffectListDataWhereUniqueInput: ["id"],
  EffectListDataOrderByWithAggregationInput: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames", "_count", "_avg", "_max", "_min", "_sum"],
  EffectListDataScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  LoggerWhereInput: ["AND", "OR", "NOT", "id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  LoggerOrderByWithRelationInput: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  LoggerWhereUniqueInput: ["id"],
  LoggerOrderByWithAggregationInput: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result", "_count", "_avg", "_max", "_min", "_sum"],
  LoggerScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  ColorCreateInput: ["color", "colorCode"],
  ColorUpdateInput: ["color", "colorCode"],
  ColorCreateManyInput: ["color", "colorCode"],
  ColorUpdateManyMutationInput: ["color", "colorCode"],
  LEDEffectCreateInput: ["name", "partName", "repeat", "frames"],
  LEDEffectUpdateInput: ["name", "partName", "repeat", "frames"],
  LEDEffectCreateManyInput: ["id", "name", "partName", "repeat", "frames"],
  LEDEffectUpdateManyMutationInput: ["name", "partName", "repeat", "frames"],
  UserCreateInput: ["name", "password", "editingPositionFrameId", "editingControlFrameId"],
  UserUpdateInput: ["name", "password", "editingPositionFrameId", "editingControlFrameId"],
  UserCreateManyInput: ["id", "name", "password"],
  UserUpdateManyMutationInput: ["name", "password"],
  EditingPositionFrameCreateInput: ["user", "editingFrame"],
  EditingPositionFrameUpdateInput: ["user", "editingFrame"],
  EditingPositionFrameCreateManyInput: ["userId", "frameId"],
  EditingPositionFrameUpdateManyMutationInput: [],
  EditingControlFrameCreateInput: ["user", "editingFrame"],
  EditingControlFrameUpdateInput: ["user", "editingFrame"],
  EditingControlFrameCreateManyInput: ["userId", "frameId"],
  EditingControlFrameUpdateManyMutationInput: [],
  DancerCreateInput: ["name", "parts", "positionData"],
  DancerUpdateInput: ["name", "parts", "positionData"],
  DancerCreateManyInput: ["id", "name"],
  DancerUpdateManyMutationInput: ["name"],
  PartCreateInput: ["name", "type", "dancer", "controlData"],
  PartUpdateInput: ["name", "type", "dancer", "controlData"],
  PartCreateManyInput: ["id", "dancerId", "name", "type"],
  PartUpdateManyMutationInput: ["name", "type"],
  PositionDataCreateInput: ["x", "y", "z", "dancer", "frame"],
  PositionDataUpdateInput: ["x", "y", "z", "dancer", "frame"],
  PositionDataCreateManyInput: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataUpdateManyMutationInput: ["x", "y", "z"],
  PositionFrameCreateInput: ["start", "editing", "positionDatas"],
  PositionFrameUpdateInput: ["start", "editing", "positionDatas"],
  PositionFrameCreateManyInput: ["id", "start"],
  PositionFrameUpdateManyMutationInput: ["start"],
  ControlDataCreateInput: ["value", "part", "frame"],
  ControlDataUpdateInput: ["value", "part", "frame"],
  ControlDataCreateManyInput: ["partId", "frameId", "value"],
  ControlDataUpdateManyMutationInput: ["value"],
  ControlFrameCreateInput: ["start", "fade", "editing", "controlDatas"],
  ControlFrameUpdateInput: ["start", "fade", "editing", "controlDatas"],
  ControlFrameCreateManyInput: ["id", "start", "fade"],
  ControlFrameUpdateManyMutationInput: ["start", "fade"],
  EffectListDataCreateInput: ["start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  EffectListDataUpdateInput: ["start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  EffectListDataCreateManyInput: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  EffectListDataUpdateManyMutationInput: ["start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  LoggerCreateInput: ["user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  LoggerUpdateInput: ["user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  LoggerCreateManyInput: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  LoggerUpdateManyMutationInput: ["user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  StringFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not"],
  ColorCountOrderByAggregateInput: ["color", "colorCode"],
  ColorMaxOrderByAggregateInput: ["color", "colorCode"],
  ColorMinOrderByAggregateInput: ["color", "colorCode"],
  StringWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not", "_count", "_min", "_max"],
  IntFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  JsonNullableListFilter: ["equals", "has", "hasEvery", "hasSome", "isEmpty"],
  LEDEffectNamePartNameCompoundUniqueInput: ["name", "partName"],
  LEDEffectCountOrderByAggregateInput: ["id", "name", "partName", "repeat", "frames"],
  LEDEffectAvgOrderByAggregateInput: ["id", "repeat"],
  LEDEffectMaxOrderByAggregateInput: ["id", "name", "partName", "repeat"],
  LEDEffectMinOrderByAggregateInput: ["id", "name", "partName", "repeat"],
  LEDEffectSumOrderByAggregateInput: ["id", "repeat"],
  IntWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  EditingPositionFrameRelationFilter: ["is", "isNot"],
  EditingControlFrameRelationFilter: ["is", "isNot"],
  UserCountOrderByAggregateInput: ["id", "name", "password"],
  UserAvgOrderByAggregateInput: ["id"],
  UserMaxOrderByAggregateInput: ["id", "name", "password"],
  UserMinOrderByAggregateInput: ["id", "name", "password"],
  UserSumOrderByAggregateInput: ["id"],
  IntNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  UserRelationFilter: ["is", "isNot"],
  PositionFrameRelationFilter: ["is", "isNot"],
  EditingPositionFrameCountOrderByAggregateInput: ["userId", "frameId"],
  EditingPositionFrameAvgOrderByAggregateInput: ["userId", "frameId"],
  EditingPositionFrameMaxOrderByAggregateInput: ["userId", "frameId"],
  EditingPositionFrameMinOrderByAggregateInput: ["userId", "frameId"],
  EditingPositionFrameSumOrderByAggregateInput: ["userId", "frameId"],
  IntNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  ControlFrameRelationFilter: ["is", "isNot"],
  EditingControlFrameCountOrderByAggregateInput: ["userId", "frameId"],
  EditingControlFrameAvgOrderByAggregateInput: ["userId", "frameId"],
  EditingControlFrameMaxOrderByAggregateInput: ["userId", "frameId"],
  EditingControlFrameMinOrderByAggregateInput: ["userId", "frameId"],
  EditingControlFrameSumOrderByAggregateInput: ["userId", "frameId"],
  PartListRelationFilter: ["every", "some", "none"],
  PositionDataListRelationFilter: ["every", "some", "none"],
  PartOrderByRelationAggregateInput: ["_count"],
  PositionDataOrderByRelationAggregateInput: ["_count"],
  DancerCountOrderByAggregateInput: ["id", "name"],
  DancerAvgOrderByAggregateInput: ["id"],
  DancerMaxOrderByAggregateInput: ["id", "name"],
  DancerMinOrderByAggregateInput: ["id", "name"],
  DancerSumOrderByAggregateInput: ["id"],
  EnumPartTypeFilter: ["equals", "in", "notIn", "not"],
  DancerRelationFilter: ["is", "isNot"],
  ControlDataListRelationFilter: ["every", "some", "none"],
  ControlDataOrderByRelationAggregateInput: ["_count"],
  PartCountOrderByAggregateInput: ["id", "dancerId", "name", "type"],
  PartAvgOrderByAggregateInput: ["id", "dancerId"],
  PartMaxOrderByAggregateInput: ["id", "dancerId", "name", "type"],
  PartMinOrderByAggregateInput: ["id", "dancerId", "name", "type"],
  PartSumOrderByAggregateInput: ["id", "dancerId"],
  EnumPartTypeWithAggregatesFilter: ["equals", "in", "notIn", "not", "_count", "_min", "_max"],
  FloatFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  PositionDataDancerIdFrameIdCompoundUniqueInput: ["dancerId", "frameId"],
  PositionDataCountOrderByAggregateInput: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataAvgOrderByAggregateInput: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataMaxOrderByAggregateInput: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataMinOrderByAggregateInput: ["dancerId", "frameId", "x", "y", "z"],
  PositionDataSumOrderByAggregateInput: ["dancerId", "frameId", "x", "y", "z"],
  FloatWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  PositionFrameCountOrderByAggregateInput: ["id", "start"],
  PositionFrameAvgOrderByAggregateInput: ["id", "start"],
  PositionFrameMaxOrderByAggregateInput: ["id", "start"],
  PositionFrameMinOrderByAggregateInput: ["id", "start"],
  PositionFrameSumOrderByAggregateInput: ["id", "start"],
  JsonFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not"],
  PartRelationFilter: ["is", "isNot"],
  ControlDataPartIdFrameIdCompoundUniqueInput: ["partId", "frameId"],
  ControlDataCountOrderByAggregateInput: ["partId", "frameId", "value"],
  ControlDataAvgOrderByAggregateInput: ["partId", "frameId"],
  ControlDataMaxOrderByAggregateInput: ["partId", "frameId"],
  ControlDataMinOrderByAggregateInput: ["partId", "frameId"],
  ControlDataSumOrderByAggregateInput: ["partId", "frameId"],
  JsonWithAggregatesFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  BoolFilter: ["equals", "not"],
  ControlFrameCountOrderByAggregateInput: ["id", "start", "fade"],
  ControlFrameAvgOrderByAggregateInput: ["id", "start"],
  ControlFrameMaxOrderByAggregateInput: ["id", "start", "fade"],
  ControlFrameMinOrderByAggregateInput: ["id", "start", "fade"],
  ControlFrameSumOrderByAggregateInput: ["id", "start"],
  BoolWithAggregatesFilter: ["equals", "not", "_count", "_min", "_max"],
  StringNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not"],
  EffectListDataCountOrderByAggregateInput: ["id", "start", "end", "description", "dancerData", "controlFrames", "positionFrames"],
  EffectListDataAvgOrderByAggregateInput: ["id", "start", "end"],
  EffectListDataMaxOrderByAggregateInput: ["id", "start", "end", "description"],
  EffectListDataMinOrderByAggregateInput: ["id", "start", "end", "description"],
  EffectListDataSumOrderByAggregateInput: ["id", "start", "end"],
  StringNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not", "_count", "_min", "_max"],
  JsonNullableFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not"],
  DateTimeFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  LoggerCountOrderByAggregateInput: ["id", "user", "variableValue", "fieldName", "time", "status", "errorMessage", "result"],
  LoggerAvgOrderByAggregateInput: ["id"],
  LoggerMaxOrderByAggregateInput: ["id", "user", "fieldName", "time", "status"],
  LoggerMinOrderByAggregateInput: ["id", "user", "fieldName", "time", "status"],
  LoggerSumOrderByAggregateInput: ["id"],
  JsonNullableWithAggregatesFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  DateTimeWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  StringFieldUpdateOperationsInput: ["set"],
  LEDEffectCreateframesInput: ["set"],
  IntFieldUpdateOperationsInput: ["set", "increment", "decrement", "multiply", "divide"],
  LEDEffectUpdateframesInput: ["set", "push"],
  EditingPositionFrameCreateNestedOneWithoutUserInput: ["create", "connectOrCreate", "connect"],
  EditingControlFrameCreateNestedOneWithoutUserInput: ["create", "connectOrCreate", "connect"],
  EditingPositionFrameUpdateOneWithoutUserNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  EditingControlFrameUpdateOneWithoutUserNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  UserCreateNestedOneWithoutEditingPositionFrameIdInput: ["create", "connectOrCreate", "connect"],
  PositionFrameCreateNestedOneWithoutEditingInput: ["create", "connectOrCreate", "connect"],
  UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  PositionFrameUpdateOneWithoutEditingNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  NullableIntFieldUpdateOperationsInput: ["set", "increment", "decrement", "multiply", "divide"],
  UserCreateNestedOneWithoutEditingControlFrameIdInput: ["create", "connectOrCreate", "connect"],
  ControlFrameCreateNestedOneWithoutEditingInput: ["create", "connectOrCreate", "connect"],
  UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  ControlFrameUpdateOneWithoutEditingNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  PartCreateNestedManyWithoutDancerInput: ["create", "connectOrCreate", "createMany", "connect"],
  PositionDataCreateNestedManyWithoutDancerInput: ["create", "connectOrCreate", "createMany", "connect"],
  PartUpdateManyWithoutDancerNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  PositionDataUpdateManyWithoutDancerNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  DancerCreateNestedOneWithoutPartsInput: ["create", "connectOrCreate", "connect"],
  ControlDataCreateNestedManyWithoutPartInput: ["create", "connectOrCreate", "createMany", "connect"],
  EnumPartTypeFieldUpdateOperationsInput: ["set"],
  DancerUpdateOneRequiredWithoutPartsNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  ControlDataUpdateManyWithoutPartNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  DancerCreateNestedOneWithoutPositionDataInput: ["create", "connectOrCreate", "connect"],
  PositionFrameCreateNestedOneWithoutPositionDatasInput: ["create", "connectOrCreate", "connect"],
  FloatFieldUpdateOperationsInput: ["set", "increment", "decrement", "multiply", "divide"],
  DancerUpdateOneRequiredWithoutPositionDataNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  EditingPositionFrameCreateNestedOneWithoutEditingFrameInput: ["create", "connectOrCreate", "connect"],
  PositionDataCreateNestedManyWithoutFrameInput: ["create", "connectOrCreate", "createMany", "connect"],
  EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  PositionDataUpdateManyWithoutFrameNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  PartCreateNestedOneWithoutControlDataInput: ["create", "connectOrCreate", "connect"],
  ControlFrameCreateNestedOneWithoutControlDatasInput: ["create", "connectOrCreate", "connect"],
  PartUpdateOneRequiredWithoutControlDataNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  EditingControlFrameCreateNestedOneWithoutEditingFrameInput: ["create", "connectOrCreate", "connect"],
  ControlDataCreateNestedManyWithoutFrameInput: ["create", "connectOrCreate", "createMany", "connect"],
  BoolFieldUpdateOperationsInput: ["set"],
  EditingControlFrameUpdateOneWithoutEditingFrameNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  ControlDataUpdateManyWithoutFrameNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  EffectListDataCreatedancerDataInput: ["set"],
  EffectListDataCreatecontrolFramesInput: ["set"],
  EffectListDataCreatepositionFramesInput: ["set"],
  NullableStringFieldUpdateOperationsInput: ["set"],
  EffectListDataUpdatedancerDataInput: ["set", "push"],
  EffectListDataUpdatecontrolFramesInput: ["set", "push"],
  EffectListDataUpdatepositionFramesInput: ["set", "push"],
  DateTimeFieldUpdateOperationsInput: ["set"],
  NestedStringFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not"],
  NestedStringWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not", "_count", "_min", "_max"],
  NestedIntFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedIntWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  NestedFloatFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedIntNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedIntNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  NestedFloatNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedEnumPartTypeFilter: ["equals", "in", "notIn", "not"],
  NestedEnumPartTypeWithAggregatesFilter: ["equals", "in", "notIn", "not", "_count", "_min", "_max"],
  NestedFloatWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  NestedJsonFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not"],
  NestedBoolFilter: ["equals", "not"],
  NestedBoolWithAggregatesFilter: ["equals", "not", "_count", "_min", "_max"],
  NestedStringNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not"],
  NestedStringNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not", "_count", "_min", "_max"],
  NestedDateTimeFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedJsonNullableFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not"],
  NestedDateTimeWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  EditingPositionFrameCreateWithoutUserInput: ["editingFrame"],
  EditingPositionFrameCreateOrConnectWithoutUserInput: ["where", "create"],
  EditingControlFrameCreateWithoutUserInput: ["editingFrame"],
  EditingControlFrameCreateOrConnectWithoutUserInput: ["where", "create"],
  EditingPositionFrameUpsertWithoutUserInput: ["update", "create"],
  EditingPositionFrameUpdateWithoutUserInput: ["editingFrame"],
  EditingControlFrameUpsertWithoutUserInput: ["update", "create"],
  EditingControlFrameUpdateWithoutUserInput: ["editingFrame"],
  UserCreateWithoutEditingPositionFrameIdInput: ["name", "password", "editingControlFrameId"],
  UserCreateOrConnectWithoutEditingPositionFrameIdInput: ["where", "create"],
  PositionFrameCreateWithoutEditingInput: ["start", "positionDatas"],
  PositionFrameCreateOrConnectWithoutEditingInput: ["where", "create"],
  UserUpsertWithoutEditingPositionFrameIdInput: ["update", "create"],
  UserUpdateWithoutEditingPositionFrameIdInput: ["name", "password", "editingControlFrameId"],
  PositionFrameUpsertWithoutEditingInput: ["update", "create"],
  PositionFrameUpdateWithoutEditingInput: ["start", "positionDatas"],
  UserCreateWithoutEditingControlFrameIdInput: ["name", "password", "editingPositionFrameId"],
  UserCreateOrConnectWithoutEditingControlFrameIdInput: ["where", "create"],
  ControlFrameCreateWithoutEditingInput: ["start", "fade", "controlDatas"],
  ControlFrameCreateOrConnectWithoutEditingInput: ["where", "create"],
  UserUpsertWithoutEditingControlFrameIdInput: ["update", "create"],
  UserUpdateWithoutEditingControlFrameIdInput: ["name", "password", "editingPositionFrameId"],
  ControlFrameUpsertWithoutEditingInput: ["update", "create"],
  ControlFrameUpdateWithoutEditingInput: ["start", "fade", "controlDatas"],
  PartCreateWithoutDancerInput: ["name", "type", "controlData"],
  PartCreateOrConnectWithoutDancerInput: ["where", "create"],
  PartCreateManyDancerInputEnvelope: ["data", "skipDuplicates"],
  PositionDataCreateWithoutDancerInput: ["x", "y", "z", "frame"],
  PositionDataCreateOrConnectWithoutDancerInput: ["where", "create"],
  PositionDataCreateManyDancerInputEnvelope: ["data", "skipDuplicates"],
  PartUpsertWithWhereUniqueWithoutDancerInput: ["where", "update", "create"],
  PartUpdateWithWhereUniqueWithoutDancerInput: ["where", "data"],
  PartUpdateManyWithWhereWithoutDancerInput: ["where", "data"],
  PartScalarWhereInput: ["AND", "OR", "NOT", "id", "dancerId", "name", "type"],
  PositionDataUpsertWithWhereUniqueWithoutDancerInput: ["where", "update", "create"],
  PositionDataUpdateWithWhereUniqueWithoutDancerInput: ["where", "data"],
  PositionDataUpdateManyWithWhereWithoutDancerInput: ["where", "data"],
  PositionDataScalarWhereInput: ["AND", "OR", "NOT", "dancerId", "frameId", "x", "y", "z"],
  DancerCreateWithoutPartsInput: ["name", "positionData"],
  DancerCreateOrConnectWithoutPartsInput: ["where", "create"],
  ControlDataCreateWithoutPartInput: ["value", "frame"],
  ControlDataCreateOrConnectWithoutPartInput: ["where", "create"],
  ControlDataCreateManyPartInputEnvelope: ["data", "skipDuplicates"],
  DancerUpsertWithoutPartsInput: ["update", "create"],
  DancerUpdateWithoutPartsInput: ["name", "positionData"],
  ControlDataUpsertWithWhereUniqueWithoutPartInput: ["where", "update", "create"],
  ControlDataUpdateWithWhereUniqueWithoutPartInput: ["where", "data"],
  ControlDataUpdateManyWithWhereWithoutPartInput: ["where", "data"],
  ControlDataScalarWhereInput: ["AND", "OR", "NOT", "partId", "frameId", "value"],
  DancerCreateWithoutPositionDataInput: ["name", "parts"],
  DancerCreateOrConnectWithoutPositionDataInput: ["where", "create"],
  PositionFrameCreateWithoutPositionDatasInput: ["start", "editing"],
  PositionFrameCreateOrConnectWithoutPositionDatasInput: ["where", "create"],
  DancerUpsertWithoutPositionDataInput: ["update", "create"],
  DancerUpdateWithoutPositionDataInput: ["name", "parts"],
  PositionFrameUpsertWithoutPositionDatasInput: ["update", "create"],
  PositionFrameUpdateWithoutPositionDatasInput: ["start", "editing"],
  EditingPositionFrameCreateWithoutEditingFrameInput: ["user"],
  EditingPositionFrameCreateOrConnectWithoutEditingFrameInput: ["where", "create"],
  PositionDataCreateWithoutFrameInput: ["x", "y", "z", "dancer"],
  PositionDataCreateOrConnectWithoutFrameInput: ["where", "create"],
  PositionDataCreateManyFrameInputEnvelope: ["data", "skipDuplicates"],
  EditingPositionFrameUpsertWithoutEditingFrameInput: ["update", "create"],
  EditingPositionFrameUpdateWithoutEditingFrameInput: ["user"],
  PositionDataUpsertWithWhereUniqueWithoutFrameInput: ["where", "update", "create"],
  PositionDataUpdateWithWhereUniqueWithoutFrameInput: ["where", "data"],
  PositionDataUpdateManyWithWhereWithoutFrameInput: ["where", "data"],
  PartCreateWithoutControlDataInput: ["name", "type", "dancer"],
  PartCreateOrConnectWithoutControlDataInput: ["where", "create"],
  ControlFrameCreateWithoutControlDatasInput: ["start", "fade", "editing"],
  ControlFrameCreateOrConnectWithoutControlDatasInput: ["where", "create"],
  PartUpsertWithoutControlDataInput: ["update", "create"],
  PartUpdateWithoutControlDataInput: ["name", "type", "dancer"],
  ControlFrameUpsertWithoutControlDatasInput: ["update", "create"],
  ControlFrameUpdateWithoutControlDatasInput: ["start", "fade", "editing"],
  EditingControlFrameCreateWithoutEditingFrameInput: ["user"],
  EditingControlFrameCreateOrConnectWithoutEditingFrameInput: ["where", "create"],
  ControlDataCreateWithoutFrameInput: ["value", "part"],
  ControlDataCreateOrConnectWithoutFrameInput: ["where", "create"],
  ControlDataCreateManyFrameInputEnvelope: ["data", "skipDuplicates"],
  EditingControlFrameUpsertWithoutEditingFrameInput: ["update", "create"],
  EditingControlFrameUpdateWithoutEditingFrameInput: ["user"],
  ControlDataUpsertWithWhereUniqueWithoutFrameInput: ["where", "update", "create"],
  ControlDataUpdateWithWhereUniqueWithoutFrameInput: ["where", "data"],
  ControlDataUpdateManyWithWhereWithoutFrameInput: ["where", "data"],
  PartCreateManyDancerInput: ["id", "name", "type"],
  PositionDataCreateManyDancerInput: ["frameId", "x", "y", "z"],
  PartUpdateWithoutDancerInput: ["name", "type", "controlData"],
  PositionDataUpdateWithoutDancerInput: ["x", "y", "z", "frame"],
  ControlDataCreateManyPartInput: ["frameId", "value"],
  ControlDataUpdateWithoutPartInput: ["value", "frame"],
  PositionDataCreateManyFrameInput: ["dancerId", "x", "y", "z"],
  PositionDataUpdateWithoutFrameInput: ["x", "y", "z", "dancer"],
  ControlDataCreateManyFrameInput: ["partId", "value"],
  ControlDataUpdateWithoutFrameInput: ["value", "part"]
};

type InputTypesNames = keyof typeof inputTypes;

type InputTypeFieldNames<TInput extends InputTypesNames> = Exclude<
  keyof typeof inputTypes[TInput]["prototype"],
  number | symbol
>;

type InputTypeFieldsConfig<
  TInput extends InputTypesNames
> = FieldsConfig<InputTypeFieldNames<TInput>>;

export type InputTypeConfig<TInput extends InputTypesNames> = {
  class?: ClassDecorator[];
  fields?: InputTypeFieldsConfig<TInput>;
};

export type InputTypesEnhanceMap = {
  [TInput in InputTypesNames]?: InputTypeConfig<TInput>;
};

export function applyInputTypesEnhanceMap(
  inputTypesEnhanceMap: InputTypesEnhanceMap,
) {
  for (const inputTypeEnhanceMapKey of Object.keys(inputTypesEnhanceMap)) {
    const inputTypeName = inputTypeEnhanceMapKey as keyof typeof inputTypesEnhanceMap;
    const typeConfig = inputTypesEnhanceMap[inputTypeName]!;
    const typeClass = inputTypes[inputTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      inputsInfo[inputTypeName as keyof typeof inputsInfo],
    );
  }
}

