const User = require('../models/user');

exports.follow = async (userId, followingId) => {
    const user = await User.findOne({where : {id : followingId}});
    if(user) {
        await user.addFollowers(parseInt(userId, 10));
        return 'ok';
    } else {
        return 'no user';
    }
}