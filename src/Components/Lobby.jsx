import { useState, useCallback, useEffect } from "react";
import React from "react";
import { useSocket } from "../Context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email_address, setEmail_address] = useState("");
  const [roomID, setRoomID] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email_address, roomID });
    },
    [email_address, roomID, socket]
  );
  const handleJoinRoom = useCallback(
    (data) => {
      const { email_address, roomID } = data;
      navigate(`/room/${roomID}`);
    },
    [navigate]
  );
  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);
  return (
    <div className="lobby flex justify-center items-center">
      <div className="lobby_section flex flex-col items-center  bg-white w-1/2 text-center rounded mt-9">
        <h1 className="text-center text-black text-2xl font-bold bg-white mt-3">
          Lobby
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 justify-center items-center p-3 pb-6"
        >
          <input
            type="email"
            placeholder="Enter Email"
            className="px-3 py-1 border rounded w-full"
            value={email_address}
            onChange={(e) => {
              setEmail_address(e.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            className="px-3 py-1 border rounded w-full"
            value={roomID}
            onChange={(e) => {
              setRoomID(e.target.value);
            }}
          />
          <button className="w-full rounded bg-lime-700 font-semibold text-white px-3 py-2">
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
