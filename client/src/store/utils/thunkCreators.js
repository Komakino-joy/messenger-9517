import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  gotSpecifiedConversation,
  addConversation,
  setSearchedUsers,
  setNewMessage,

} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    
    const transformedData = await data.map(conversation => (
        { ...conversation , 
          unreadMessages: conversation.messages.reduce((acc, message) => 
            message.senderId === conversation.otherUser.id && message.read === false ? acc + 1 : acc, 0
          ),
          lastRead: conversation.messages.slice().reverse().find(message => 
            message.read === true && message.senderId !== conversation.otherUser.id),
        }
      )
    );

    dispatch(gotConversations(transformedData));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {

  socket.emit("new-message", {
    message:  data.message,
    recipientId:  body.recipientId,
    sender:  data.sender,
  });

};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage =  (body) => async(dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }
    
    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};

export const readMessages = (body) => async (dispatch) =>{
  try {
    await axios.put("/api/messages/read-status", body);

    dispatch(fetchSpecifiedConversation(body.conversation))
  } catch (error) {
    console.error(error);
  }
};

export const fetchSpecifiedConversation = (conversation) => async (dispatch) => {
  try {
    const { data } = await axios.post("/api/conversations/fetch-single-convo", {conversation});

    const transformedData = 
        { ...data , 
          unreadMessages: data.messages.reduce((acc, message) => 
            message.senderId === data.otherUser.id && message.read === false ? acc + 1 : acc, 0
          ),
          lastRead: data.messages.slice().reverse().find(message => 
            message.read === true && message.senderId !== data.otherUser.id),
        };

    dispatch(gotSpecifiedConversation(transformedData));
  } catch (error) {
    console.error(error);
  }
};

export const openConvo = async (body) => {
  socket.emit("open-convo", {
    conversation: body.conversation,
    user:body.user,
  });

};