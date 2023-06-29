import React, { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import React from 'react'

function SendMessage() {
    const [message, setMessage] = useState("");
  return (
    <div>
    </div>
  )
}

export default SendMessage