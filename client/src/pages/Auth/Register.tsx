
const Register = () => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    e.currentTarget.reset();
  }


  return (
    <form onSubmit={handleSubmit}>
      <div>
        <div>
          <h2>Register</h2>
        </div>
        <div>

          <div>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Name" required />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Email" required/>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Password" required/>
          </div>

          <div>
            <button type="submit">Register</button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Register;