import { instance } from  "./axios"

const getDancerFiberData = async (dancerName: string) => {
    try {
      const res = await instance.get("/getDancerFiberData", {
        params: {dancer: dancerName}
      });

      return {
        token: res.data.token,
        success: res.status === 200,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }