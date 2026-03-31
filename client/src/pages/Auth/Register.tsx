import { isEmail, isNotEmpty, hasMinLength, isEqualToOtherValue } from "../../utils/formValidations";
import {useActionState} from "react";

type FormState = {
  errors: string[] | null;
  enteredValues?: EnteredValues;
};

interface EnteredValues{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}


const Register = () => {
  const signupAction = (prevFormState: FormState, formData: FormData): FormState => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    const errors: string[] = [];

    if (!isEmail(email)){
      errors.push('Email is invalid');
    }

    if(!isNotEmpty(password) || !hasMinLength(password, 6)) {
      errors.push("Password must be at least 6 characters");
    }

    if(!isEqualToOtherValue(password, confirmPassword)){
      errors.push("Passwords do not match");
    }

    if (!isNotEmpty(name)){
      errors.push("Provide a valid name");
    }

    if (errors.length > 0){
      return {errors, enteredValues: {
        name,
        email,
        password,
        confirmPassword
      }};
    }

    console.log(`Name: ${name}, Email: ${email}, password: ${password}`);

    return {errors: null};

  }

  const [formState, formAction] = useActionState<FormState, FormData>(signupAction, {errors: null});

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   console.log("Submitted");

  //   const formData = new FormData(e.currentTarget);
  //   const data = Object.fromEntries(formData.entries());
  //   e.currentTarget.reset();
  //   console.log(data);
  // }

  return (
    <form action={formAction}>
      <div>
        <div>
          <h2>Register</h2>
        </div>
        <div>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              required
              defaultValue={formState.enteredValues?.name}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
              defaultValue={formState.enteredValues?.email}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              minLength={6}
              defaultValue={formState.enteredValues?.password}
            />
          </div>

          <div>
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Confirm password"
              required
              minLength={6}
              defaultValue={formState.enteredValues?.confirmPassword}
            />
          </div>

          {formState.errors && (
            <ul>
              {formState.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <div>
            <button type="submit">Register</button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Register;