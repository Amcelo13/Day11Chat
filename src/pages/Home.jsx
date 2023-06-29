import React, { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { getTime } from "../utils/getTime";
import {
  SearchOutlined,
  VideoCameraOutlined,
  PicRightOutlined,
  SendOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./Home.css";
import Emo from "../assets/emojisv.svg";
import { db } from "../utils/firebase";
import Pro from "../assets/profile.svg";
import Lomg from "../assets/LOG.svg";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  onSnapshot,
  arrayUnion,
  doc,
  where,
} from "firebase/firestore";
import {
  setUser,
  setReciever,
  setRoom,
  setOnline,
  setLogout,
} from "../app/features/templateSlice";

function Home() {
  const dispatch = useDispatch();
  const user_data_email = useSelector((state) => state.users.email);
  const sender = useSelector((state) => state.users);
  const reciever = useSelector((state) => state.currentReciever);
  const currentuserID = useSelector((state) => state.CurrentUserId);
  const currentRoom = useSelector((state) => state.currentRoom);
  const online = useSelector((state) => state.online);
  
  const [onlinestatus, setOnlineStatus] = useState(false)
  const [msg_database, setMsg_database] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users_from_database, setusers_from_database] = useState([]); // Move the declaration here

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredUsers = users_from_database[0]
    ? users_from_database[0].filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  const [message, setMessage] = useState([]);
  const [openemoji, setopenemoji] = useState(false);
  const userCollectionRef = collection(db, "users");
  const roomCollectionRef = collection(db, "room");

  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setMessage(message + emoji);
  };

  useEffect(() => {
    //setting room onclick messages
    const q = query(collection(db, "room"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
        if (currentRoom !== "-1") {
          setMsg_database(messages.filter((item) => item.room_id === currentRoom)
          );
        }
      });
    });
    return () => {
      unsubscribe();
    };
  }, [currentRoom]);

  useEffect(()=>{
    //getting users in realtime
    const q1 = query(collection(db, "users"));
    const unsubscribe1 = onSnapshot(q1, (querySnapshot) => {
      let userslist = [];
      querySnapshot.forEach((doc) => {
        userslist.push({ ...doc.data(), id: doc.id });
        setusers_from_database([...users_from_database, userslist])
      });
    });
    return () => {
      unsubscribe1();
    };
  },[])

  const handleRoom = async (reciever_id) => {
    dispatch(setReciever(reciever_id));
    //room logic
    const room_id =
      reciever_id.uid > sender.uid
        ? "" + sender.uid + reciever_id.uid
        : "" + reciever_id.uid + sender.uid;
    dispatch(setRoom(room_id));
    // console.log(reciever_id.uid, sender.uid, room_id, "Idssss");
  };

  //SENDING THE MESSAGE
  const handleSend = async () => {
    const roomData = await getDocs(roomCollectionRef);

    // Checking the duplicate room
    const duplicateRoom = roomData.docs.filter((room) => room?.data()?.room_id === currentRoom);
    if (duplicateRoom[0]?.id) {
      await updateDoc(doc(db, "room", duplicateRoom[0]?.id), {
        text: arrayUnion({
          msg: message,
          time: new Date(),
          sender_id: sender.uid,
        }),
        time: serverTimestamp(),
        room_id: currentRoom,
        sender_id: sender.uid,
      });
    } else {
      await addDoc(roomCollectionRef, {
        text: [{ msg: message, time: new Date(), sender_id: sender.uid }],
        time: serverTimestamp(),
        room_id: currentRoom,
      });
    }
    setMessage("");
    setopenemoji(false);
  };
  const handleLogout = async() => {
    dispatch(setLogout());
    const q = query(userCollectionRef, where("email","==",user_data_email))
    const LOGGED_USER  = await getDocs(q)
    let datanow ;
    LOGGED_USER.forEach((user) => {
        updateDoc(user.ref,{
          online:false
        })
    })
  };

  return (
    <div className="container">
      <div className="top">
        <div style={{ marginLeft: "-2rem", paddingRight: "2rem" }}>
          <img src={Lomg} alt="" />
        </div>
        <div className="search">
          <SearchOutlined
            style={{ paddingTop: "1.27em", paddingRight: "1rem" }}
          />
          <input
            type="text"
            placeholder="Search"
            className="search--inp"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="user_profile">
          <img
            width="75px"
            src={Pro}
            alt=""
            style={{ width: "3.5rem", paddingRight: "1rem" }}
          />
          <h2 style={{ paddingTop: "0.1rem", color: "white" }}>
            {reciever?.name}
          </h2>

          <div className="online1">
            <span className={onlinestatus  ? `dot1` : `dotdisabled1`}>dot</span>
          </div>
        </div>

        <div className="calls">
          <VideoCameraOutlined className="call-each" />
          <SearchOutlined className="call-each" />
          <PicRightOutlined className="call-each" />
          <LogoutOutlined className="call-each1" onClick={handleLogout} />
        </div>
      </div>

      <div className="bottom">
        <div className="left">
          <h2
            style={{
              textAlign: "left",
              paddingLeft: "1.6rem",
              position: "sticky",
              top: "0rem",
              backgroundColor: "white",
              paddingRight: "16rem",
              paddingBottom: "1.5rem",
              paddingTop: "1.2rem",
              opacity: "0.8",
              marginTop: "0.5rem",
              zIndex: "3",
            }}
          >
            Chats
          </h2>

          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              if (sender.uid !== user.uid)
                return (
                  <div
                    className={user.uid === reciever.uid ? `user2` : `user1`}
                    key={user.id}
                    onClick={() => handleRoom(user)}
                  >
                    <img
                      width="70px"
                      src={Pro}
                      alt=""
                      className="click--userimg"
                    />
                    <div>
                      <h3
                        className={
                          user.uid === reciever.uid
                            ? `user--name2`
                            : `user--name`
                        }
                      >
                        {user.name}
                      </h3>
                      <p
                        className={
                          user.uid === reciever.uid
                            ? `faint--chat2`
                            : `faint--chat`
                        }
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div className="online">
                      <span
                        className={
                          user.online === true ? `dot` : `dotdisabled`
                        }
                      >
                        dot
                      </span>
                    </div>
                  </div>
                );
            })
          ) : (
            <p>No users found.</p>
          )}

          <div className="user1">
            <img width="70px" src={Pro} alt="" className="click--userimg" />
            <div>
              <h3 className="user--name">Dummy</h3>
              <p className="faint--chat">Hi there I am using Chat Chat</p>
            </div>
          </div>
        </div>

        <div className="right">
          <div className="main--chat">
            {msg_database[0]?.text.map((item) => {
              if (item.sender_id === sender.uid) {

                const t = item?.time;
                const date = t?.seconds ? new Date(t.seconds * 1000) : null;
                const formattedTime = date ? date.toLocaleTimeString() : null;

                return (
                  <p className="righthand" key={msg_database[0]?.id}>
                    <>
                      <span className="right--span">{item?.msg}</span>
                      <p
                        style={{
                          color: "black",
                          fontSize: "13px",
                          paddingTop: ".8rem",
                          marginRight: "1rem",
                        }}
                      >
                        {formattedTime}
                      </p>
                    </>
                  </p>
                );
              } else {

                const t = item?.time;
                const date = t?.seconds ? new Date(t.seconds * 1000) : null;
                const formattedTime = date ? date.toLocaleTimeString() : null;
                return (
                  <p className="lefthand" key={item.sender_id}>
                    <>
                      <span className="left--span">{item?.msg}</span>
                      <span
                        style={{
                          color: "black",
                          fontSize: "13px",
                          paddingTop: ".8rem",
                          marginRight: "1rem",
                        }}
                      >
                        {" "}
                        <br /> <br />
                        {formattedTime}
                      </span>
                    </>
                  </p>
                );
              }
            })}
          </div>
          <div className="outerdiv">
            <div className="chatdiv">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                type="text"
                required
                className="chatbox"
                placeholder="Type your chat here"
                style={{ fontSize: "1.2rem" }}
              />

              <img
                src={Emo}
                width="40px"
                style={{
                  paddingTop: ".1rem",
                  cursor: "pointer",
                  paddingLeft: "2rem",
                }}
                height="50px"
                alt=""
                onClick={() => setopenemoji(!openemoji)}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "9.5rem",
                  right: "6.5rem",
                }}
              >
                {openemoji ? <EmojiPicker onEmojiClick={addEmoji} /> : ""}
              </div>
            </div>

            <SendOutlined
              className="send--btn"
              type="submit"
              onClick={handleSend}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
