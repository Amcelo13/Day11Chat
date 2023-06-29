import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AutoComplete, Button, Col, Form, Input, Select } from "antd";
import Sampli from "../assets/Sample.mp4";
import GOG from "../assets/google.svg";
import "./Home.css";
import {  LoadingOutlined } from "@ant-design/icons";
//redux
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  setLogin,
  selectUser,
  setUserId,
  setOnline,
} from "../app/features/templateSlice";

import { auth, googleProvider } from "../utils/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  query,
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

function Login() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isloading, setloading] = useState(false);
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const currentuser = useSelector((state) => state.CurrentUser);
  let users_from_database = [];

  const [form] = Form.useForm();

  const userCollectionRef = collection(db, "users");

  //GETTING THE USERS
  useEffect(() => {
    const getUsers = async () => {
      try {
        const q = await getDocs(userCollectionRef);
        const res = q.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        users_from_database = [...res]; //appending into the users array
   
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
   
  }, [])
  ;
  const createUserUsingGoogle = async (input, id) => {
    console.log("first");
    await addDoc(userCollectionRef, {
      name: input.displayName,
      email: input.email,
      uid: id,
      online: true
    });
  };

  const onFinish = (values) => {

    setloading(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async(usercreds) => {
        // console.log("Sent user creds from Login without gOath", usercreds.user);
        setErr(false);
        setloading(false);

        const q = query(userCollectionRef, where("email","==",usercreds.user.email))
            const LoggedUserArray = await getDocs(q)
            let datanow ;
            LoggedUserArray.forEach(user =>  {
              datanow = user.data()
              updateDoc(user.ref, {
                online:true,
              })
            })
         
        const filterData = duplicateCheck(values.email, users_from_database);
        if (filterData.length === 0) {
          console.log(users_from_database);
          alert("User Doesnt Exist");
        } else {
          dispatch(setUserId(filterData[0].uid));
          dispatch(setLogin(filterData[0]));
          navigate("/home");
        }
      })
      .catch((err) => {
        console.log(err.code);
        console.log(err.message);
        setErr(err.message);
        setloading(false);
      });
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const id = Date.now();
      const filterData = duplicateCheck(
        res._tokenResponse.email,
        users_from_database
      );
      //if no duplication
      if (filterData.length === 0) {
        createUserUsingGoogle(res._tokenResponse, id);
        dispatch(setUserId(id));
        dispatch(
          setLogin({
            email: res._tokenResponse.email,
            name: res._tokenResponse.displayName,
            uid: id,
            
          })
        );
      } 
      //if duplication exists
      else {
        const q = query(userCollectionRef, where("email",'==' ,res._tokenResponse.email))
        const LoggedUserArray = await getDocs(q)
        let datanow ;
        LoggedUserArray.forEach(user =>  {
          datanow = user.data()
          updateDoc(user.ref, {
            online:true,
          })
        })
        dispatch(setUserId(filterData[0].uid));
        dispatch(setLogin(filterData[0]));
        
      }
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };
  const gotosignup = () => {
    navigate("/");
  };
  return (
    <div className="signback">
      <div
        className="image"
        style={{ height: "100vh", backgroundColor: "#d7d6d7" }}
      >
        <video
          autoPlay
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
            paddingLeft: "4rem",
            paddingBottom: "1.5rem",
          }}
        >
          Log In
        </h1>
        <p
          className="gauth"
          style={{
            paddingLeft: "4rem",
            paddingBottom: "1.5rem",
          }}
        >
          <button
            style={{
              padding: "1.3rem",
              border: "none",
              background: "#fff",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              cursor: "pointer",
              borderRadius: "1rem",
            }}
            onClick={signInWithGoogle}
          >
            {" "}
            <img
              src={GOG}
              width="20px"
              style={{ marginTop: "-1rem", marginBottom: "-.35rem" }}
              alt=""
            />{" "}
            Continue with google{" "}
          </button>
        </p>
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
                  Log In
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
            New here{" "}
            <span
              style={{
                color: "powderBlue",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={gotosignup}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
