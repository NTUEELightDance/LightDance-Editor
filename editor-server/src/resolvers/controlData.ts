import { Resolver, Ctx, Query, Mutation, PubSub, Publisher, Arg, ID } from 'type-graphql'
import { ControlMap } from './types/controlMap'
import { EditControlInput } from './inputs/control'

interface LooseObject {
    [key: string]: any
}

@Resolver(of => ControlMap)
export class ControlDataResolver {    
    @Mutation(returns => ControlMap)
    async editControlMap(
        // @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
        @Arg("controlDatas", type=>[EditControlInput]) controlDatas: EditControlInput[], 
        @Arg("frameID") frameID: string,
        @Ctx() ctx: any
    ) {
        const {editing, _id} = await ctx.db.ControlFrame.findOne({id: frameID})
        console.log(editing, ctx.userID)
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
        
        
        // const payload: DancerPayload = {
        //     mutation: dancerMutation.UPDATED,
        //     editBy: ctx.userID,
        //     dancerData
        // }
        // await publish(payload)
        return {frames:[{_id, id: frameID}]}
    }
}
