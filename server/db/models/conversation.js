const { Op, ARRAY, INTEGER } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {
  otherUsersIds  : { type : ARRAY(INTEGER), defaultValue: null}
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, otherUsers) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id]
      },
      otherUsersIds: {
        [Op.or]: [otherUsers]
      }
    }
  });

  return conversation;
};

module.exports = Conversation;
