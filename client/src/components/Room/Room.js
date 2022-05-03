import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col } from "react-grid-system";
import Swal from "sweetalert2";
import Topbar from "../common/Topbar";
import Player from "./Player";
import Chat from "./Chat/Chat";
import Options from "./Options";
import { Spinner } from "../common/Spinner";
import { createConnection, bindSocketEvents } from "../../utils/socket";
import { getVideoId } from "../../utils/helper";
import { UserContext } from "../../contexts/UserContext";
import { SignalContext } from "../../contexts/SignalContext";
import { useParams } from "react-router-dom";

function Room(props) {
  const [isHost, setHost] = useState(false);
  const [socket, setSocket] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);

  const { dispatch: userDispatch, userData } = useContext(UserContext);
  const { dispatch: signalDispatch } = useContext(SignalContext);

  let _isHost = false;
  let _socket = null;

  const init = async () => {
    const hostId = props.location.state && props.location.state.hostId;
    const videoId = props.location.state && props.location.state.videoId;
    let username = props.location.state && props.location.state.username;

    if (!hostId) {
      // Not a host
      _isHost = false;

      const username = "none";

      const roomId = props.match.params.id;
      _socket = await createConnection(username, roomId);
    } else {
      _isHost = true;
      _socket = props.location.socket;

      // update videoid in global context
      userDispatch({ type: "UPDATE_VIDEO_ID", videoId });
    }

    // update username in global context
    userDispatch({ type: "UPDATE_USERNAME", username });

    setHost(_isHost);
    setSocket(_socket);
    bindSocketEvents(_socket, {
      userDispatch,
      signalDispatch,
    });

    console.log("is host", isHost);
    setRoomLoading(false);
  };

  useEffect(
    () => {
      init();
    }, // eslint-disable-next-line
    []
  );
  const askVideoURL = async () => {
    const { value: url } = await Swal.fire({
      title: "YouTube Video URL",
      input: "url",
      inputPlaceholder: "https://www.youtube.com/watch?v=BTYAsjAVa3I",
    });

    return url;
  };

  const onVideoChange = async () => {
    const newURL = await askVideoURL();

    if (newURL && socket) {
      console.log(_socket);
      const videoId = getVideoId(newURL);
      socket.emit("changeVideo", { videoId });
    }
  };

  const alertNotImplemented = () => {
    alert("Not implemented");
  };

  const startup_params = useParams();

  useEffect(
    () => {
      if (startup_params["youtube_id"] && socket) {
        const videoId = startup_params["youtube_id"];
        socket.emit("changeVideo", { videoId });
      }
    }, // eslint-disable-next-line
    [socket, startup_params]
  );

  return (
    <React.Fragment>
      <Topbar />
      {roomLoading ? (
        <Spinner />
      ) : (
        <Container fluid style={{ margin: "0 3%" }}>
          <Row>
            <Col md={12}>
              <Player socket={socket} videoId={userData.videoId} />

              <Options
                alertNotImplemented={alertNotImplemented}
                onVideoChange={onVideoChange}
              />
              {/* <Chat socket={socket} /> */}
            </Col>
          </Row>
        </Container>
      )}
    </React.Fragment>
  );
}

export default Room;
