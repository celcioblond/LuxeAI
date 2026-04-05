import useAuth from "../../hooks/useAuth";

const AdminDashboard = () => {
  const {user} = useAuth();

  return (
    <>
      <header>
        <nav>
          <div>
            <h1>Welcome {user.name}</h1>
          </div>
        </nav>
      </header>
    </>
  )
}

export default AdminDashboard;