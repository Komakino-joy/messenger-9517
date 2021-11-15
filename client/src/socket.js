import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
} from "./store/conversations";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    console.log('online')
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    console.log('remove-offline-user')
    store.dispatch(removeOfflineUser(id));
  });
  
  socket.on("add-new-message", (data) => {
    console.log("new message to serve");
    console.log('socket data: ', {data})
    store.dispatch(setNewMessage(data.message, data.sender));
  });
});

export default socket;
