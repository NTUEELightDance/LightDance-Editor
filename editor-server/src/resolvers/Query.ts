const Query = {
    async users(parent: any, args: any, {db}: any){
        const users = await db.User.find()
        return users
    },
    async user(parent: any, args: any, {db, userID}: any){
        const user = await db.User.findOne({userID});
        return user
    },
};

export { Query as default };