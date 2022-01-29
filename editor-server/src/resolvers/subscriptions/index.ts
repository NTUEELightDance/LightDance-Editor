import {
    Resolver,
    Query,
    FieldResolver,
    Arg,
    Ctx,
    Root,
    Mutation,
    Int,
    ResolverInterface,
    Publisher,
    PubSub,
    Subscription,
} from 'type-graphql';

import {Topic} from "./topic"
import { ControlRecordPayload } from './controlRecord';
import { ControlMapPayload } from './controlMap';
import { PositionRecordPayload } from './positionRecord';
import { PositionMapPayload } from './positionMap';
import { DancerPayload } from './dancer';
import { ColorPayload } from './color';

@Resolver()
class SubscriptionResolver{
    @Subscription({
        topics: Topic.Color
    })
    colorSubscription(
        @Root() colorPayload: ColorPayload
    ): ColorPayload{
        return colorPayload
    }

    @Subscription({
        topics: Topic.ControlRecord
    })
    controlRecordSubscription(
        @Root() controlRecordPayload:ControlRecordPayload
    ): ControlRecordPayload{
        return controlRecordPayload
    }

    @Subscription({
        topics: Topic.ControlMap
    })
    controlMapSubscription(
        @Root() controlMapPayload:ControlMapPayload
    ): ControlMapPayload{
        return controlMapPayload
    }

    @Subscription({
        topics: Topic.Dancer
    })
    DancerSubscription(
        @Root() dancerPayload:DancerPayload
    ): DancerPayload{
        return dancerPayload
    }

    @Subscription({
        topics: Topic.PositionRecord
    })
    positionRecordSubscription(
        @Root() positionRecordPayload:PositionRecordPayload
    ): PositionRecordPayload{
        return positionRecordPayload
    }

    @Subscription({
        topics: Topic.PositionMap
    })
    positionMapSubscription(
        @Root() positionMapPayload:PositionMapPayload
    ): PositionMapPayload{
        return positionMapPayload
    }
}

export default SubscriptionResolver
