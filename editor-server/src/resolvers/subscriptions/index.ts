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
import { DancerPayload } from './dancer';

@Resolver()
class SubscriptionResolver{
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

}

export default SubscriptionResolver
