import { useNavigate } from "react-router-dom";
import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  Col,
  Form,
  Input,
  Select,
} from "antd";
import GOG from "../assets/google.svg";
import Sampli from "../assets/Sample.mp4";
import "./Home.css";
import { LoadingOutlined } from "@ant-design/icons";
//redux
import { useDispatch, useSelector } from "react-redux";
import {
  setOnline,
  setUser,
  setLogin,
  selectUser,
  setUserId,
} from "../app/features/templateSlice";

import { auth, googleProvider } from "../utils/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { duplicateCheck } from "../utils/duplicateCheck";

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

function Signup() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isloading, setloading] = useState(false);
  const currentuser = useSelector((state) => state.CurrentUser);
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const userCollectionRef = collection(db, "users");
  const [users_from_database, setusers_from_database] = useState([]);

  //adding a user IN FIRESTORE
  const createUser = async (obj) => {
    console.log(obj);
    await addDoc(userCollectionRef, obj);
    // dispatch(setUserId(id))
  };

  //GETTING THE USERS
  useEffect(() => {
    const getUsers = async () => {
      try {
        const q = await getDocs(userCollectionRef);
        const res = q.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setusers_from_database([...users_from_database, res]); //appending into the users array
        // console.log(users_from_database);
        console.log(users_from_database);
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
  }, []);

  const onFinish = (values) => {
    setloading(true);
    const id = Date.now();
    // if (duplicateCheck.length === 0) {
    //means on filtering users if duplicate length is 0 then cal this signin

    // }

    //auth
    createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password,
      values.name
    )
      .then((usercreds) => {
        console.log(
          "Sent user creds from signup without gOath",
          usercreds.user
        );
        setErr(false);
        // dispatch(setLogin(usercreds.user)) not here
        setloading(false);
        const id = Date.now();
        dispatch(setUser(values.name));
        dispatch(setOnline(true));
        dispatch(setUserId(id));
        const filterData = duplicateCheck(
          usercreds.user.email,
          users_from_database
        );
        // console.log(first)
        if (filterData.length !== 0) {
          alert("user Already exists!!!");
        }
      })
      .catch((err) => {
        console.log(err.code);
        console.log(err.message);
        setErr(err.message);
        setloading(false);
      });
    createUser({ name: values.name, email: values.email, uid: Date.now() ,online: true });
    navigate("/login");
  };

  const gotologin = () => {
    navigate("/login");
  };
  return (
    <div className="signback">
      <div
        className="image"
        style={{ height: "100vh", backgroundColor: "#d7d6d7" }}
      >
        <video
          autoPlay
          muted
          loop
          src={Sampli}
          width="600px"
          height="inherit"
        ></video>
      </div>
      <div
        style={{
          height: "auto", // paddingTop: "1rem",
        }}
      >
        <h1
          style={{
            paddingTop: "15rem",
            paddingLeft: "5rem",
            paddingBottom: "1.5rem",
          }}
        >
          Sign up
        </h1>
        <p
          className="gauth"
          style={{
            paddingLeft: "5rem",
            paddingBottom: "1.5rem",
          }}
        ></p>
        <div className="yolu">
          <Form
            {...formItemLayout}
            form={form}
            name="register"
            onFinish={onFinish}
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
            style={{
              maxWidth: 600,
            }}
            scrollToFirstError
          >
            <Form.Item
              name="name"
              label="Name"
              tooltip="What do you want others to call you?"
              rules={[
                {
                  required: true,
                  message: "Please input your nickname!",
                  whitespace: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input your E-mail!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <p style={{ color: "red", paddingLeft: "4rem" }}>{err}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "10rem",
                paddingLeft: "11rem",
              }}
            >
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>
              </Form.Item>

              {isloading ? (
                <p style={{ marginTop: "0.2rem" }}>
                  {" "}
                  <LoadingOutlined />
                </p>
              ) : (
                ""
              )}
            </div>
          </Form>
          <p style={{ marginTop: "-3rem" }}>
            Already In Use{" "}
            <span
              style={{
                color: "powderBlue",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={gotologin}
            >
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
