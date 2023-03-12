import { instance } from  "./axios"

const getDancerLEDData = async (dancerName: string) => {
    try {
        const res = await instance.get(`/getDancerLEDData?dancer=${dancerName}`)
        if(!res.data) console.log(`[API GET ERROR] ${dancerName} cannot be found in editor server /getDancerLEDData API`)
        return {
            success: !(!res.data),
            data: res.data,
          }
        } catch (error) {
          return {
            success: false,
            message: error,
          };
        }
  }

  export { getDancerLEDData }