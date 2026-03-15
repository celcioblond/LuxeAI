import { v4 as uuid } from "uuid";
import HttpError from "../models/http-error.js";

const dummy_users = [{
  id: 1,
  name: "celcio",
  email: "celcio@hotmail.com",
  password: "pass123"
}]

export const signup = ((req, res, next) => {
  const {name, email, password } = req.body;

  const hasUser = dummy_users.find((u) => u.email === email);

  if(hasUser) {
    throw new HttpError("Could not create user, email already exists", 422);
  }

  const newUser = {
    id: uuid(),
    name,
    email,
    password
  }

  dummy_users.push(newUser);
  res.status(200).json({user: newUser});
});

export const login = ((req, res, next) => {
  const {name, email, password } = req.body;

  const identifiedUser = dummy_users.find((u) => u.email === email);
  if (identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Failed to identify user", 404);
  }
  res.json({message: "Log in succesful"});
});