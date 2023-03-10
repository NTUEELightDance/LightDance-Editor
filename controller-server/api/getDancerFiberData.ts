import { instance } from  "./axios"

const getDancerFiberData = async (dancerName: string) => {
    try {
      const res = await instance.get(`/getDancerFiberData?dancer=${dancerName}`)
      if(!res.data) console.log(`[API GET ERROR] ${dancerName} cannot be found in editor server /getDancerFiberData API`)
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

  export { getDancerFiberData }