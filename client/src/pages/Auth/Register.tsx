import { useRef, useState, useEffect} from "react";

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,24}$/;

const Register = () => {

  const userRef = useRef();
  const errorRef = useRef();

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);

  return (
    <div>
      <h1>register page</h1>
    </div>
  )
}

export default Register;