import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId, lastRead} = props;

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <>
          <SenderBubble 
            key={message.id} 
            text={message.text} 
            time={time}
            id={message.id}  
            read={message.read} 
            lastRead={lastRead} 
            otherUser={otherUser}
          />
          <button onClick={()=>console.log(lastRead)}>last</button>
          </>
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser}  />
        );
      })}
    </Box>
  );
};

export default Messages;
