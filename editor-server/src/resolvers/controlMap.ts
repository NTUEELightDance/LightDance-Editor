import { Resolver, Ctx, Query, Mutation, PubSub, Publisher, Arg, ID } from 'type-graphql'
import { ControlMap } from './types/controlMap'
import { EditControlInput } from './inputs/control'
import { Topic } from "./subscriptions/topic"
import { ControlMapPayload, ControlMapMutation } from "./subscriptions/controlMap"

interface LooseObject {
    [key: string]: any
}


@Resolver(of => ControlMap)
export class ControlMapResolver {
    @Query(returns => ControlMap)
    async ControlMap(@Ctx() ctx: any) {
        let frames = await ctx.db.ControlFrame.find()
        const id = frames.map((frame: any) => { return { id: frame.id, _id: frame._id } })
        return { frames: id }
    }

    @Mutation(returns => ControlMap)
    async editControlMap(
        @PubSub(Topic.ControlMap) publish: Publisher<ControlMapPayload>,
        @Arg("controlDatas", type=>[EditControlInput]) controlDatas: EditControlInput[], 
        @Arg("frameID") frameID: string,
        @Ctx() ctx: any
    ) {
        const {editing, _id} = await ctx.db.ControlFrame.findOne({id: frameID})
        if(editing !== ctx.userID){
            throw new Error("The frame is now editing by other user.");
        }
        await Promise.all(
            controlDatas.map(async(data: any)=> {
                const {dancerName, controlDatas} = data
                const dancer = await ctx.db.Dancer.findOne({name: dancerName}).populate("parts")
                await Promise.all(
                    controlDatas.map(async(data: any)=> {
                        const {partName, ELValue, color, src, alpha} = data
                        const {controlData, type} = dancer.parts.filter((part: any)=>part.name === partName)[0]
                        const oldControls =  await Promise.all(
                            controlData.map(async(control: any)=>{
                                const data = await ctx.db.Control.findById(control)
                                if (data.frame.toString() === _id.toString()){
                                    return control
                                }
                            })
                        )
                        const controlID = oldControls.filter((data:any)=>data)[0]
                        const {value} = await ctx.db.Control.findById(controlID)
                        if(type === "FIBER"){
                            if(color){
                                value.color = color
                            }
                            if(alpha){
                                value.alpha = alpha
                            }
                        }else if(type === "EL"){
                            if(ELValue){
                                value.value = ELValue
                            }
                        }else  if(type === "LED"){
                            if(src){
                                value.src = src
                            }
                            if(alpha){
                                value.alpha = alpha
                            }
                        }
                        await ctx.db.Control.updateOne({_id: controlID}, {value})
                    })
                )
            })
        )
        
        const payload: ControlMapPayload = {
                mutation: ControlMapMutation.UPDATED,
                editBy: ctx.userID,
                frames: [{_id, id: frameID}]
        }
        await publish(payload)
        return {frames:[{_id, id: frameID}]}
    }
}
