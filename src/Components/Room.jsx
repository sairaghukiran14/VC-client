import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Peer from "../Services/Peer";
import { useSocket } from "../Context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketID, setRemoteSocketID] = useState(null);
  const [myStream, setMystream] = useState();
  const [remoteStream, setRemotestream] = useState();
  //
  const handleuserJoined = useCallback(({ email_address, id }) => {
    console.log(`Email ${email_address} joined the room`);
    setRemoteSocketID(id);
  }, []);
  //

  //
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await Peer.getOffer();
    socket.emit("user:call", { to: remoteSocketID, offer });
    setMystream(stream);
  }, [remoteSocketID, socket]);
  //
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketID(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMystream(stream);
      console.log(`Incomming call ,${from} ,${offer}`);
      const ans = await Peer.getAnwser(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );
  //
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      Peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  //
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      Peer.setLocalDescription(ans);
      console.log(`Accepted call ${from} ${ans}`);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await Peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketID });
  }, [remoteSocketID, socket]);
  const handleNegotiationNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await Peer.getAnwser(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );
  const handleNegotiationNeedFinal = useCallback(async ({ ans }) => {
    await Peer.setLocalDescription(ans);
  }, []);
  //
  useEffect(() => {
    Peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => {
      Peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);
  useEffect(() => {
    Peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("Got Tracks");
      setRemotestream(remoteStream[0]);
    });
  }, []);

  //

  useEffect(() => {
    socket.on("user:joined", handleuserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegotiationNeedIncomming);
    socket.on("peer:nego:final", handleNegotiationNeedFinal);
    return () => {
      socket.off("user:joined", handleuserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegotiationNeedIncomming);
      socket.off("peer:nego:final", handleNegotiationNeedFinal);
    };
  }, [
    socket,
    handleuserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegotiationNeedIncomming,
    handleNegotiationNeedFinal,
  ]);
  //
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-xl">Room</h1>

      {remoteSocketID ? "Connected" : "No One in the room"}
      {myStream && (
        <button
          className="px-2 py-1 bg-orange-400 text-white rounded"
          onClick={sendStreams}
        >
          SendStream
        </button>
      )}
      <br />
      {remoteSocketID && (
        <button
          onClick={handleCallUser}
          className="bg-blue-500 w-24 text-white rounded"
        >
          Call
        </button>
      )}

      {myStream && (
        <>
          <h2 className="text-center font-semibold mt-4">Your Video</h2>
          <ReactPlayer
            playing
            muted
            url={myStream}
            height="300px"
            width="500px"
          />
        </>
      )}

      {remoteStream && (
        <>
          <h2 className="text-center font-semibold mt-4">remote Video</h2>
          <ReactPlayer
            playing
            muted
            url={remoteStream}
            height="300px"
            width="500px"
          />
        </>
      )}
    </div>
  );
};

export default Room;
