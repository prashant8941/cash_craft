export default function Login() {
    const login = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/login", {
  return(
    <>
    <div>Login Page</div>
    <form action="login" method="post">
        <label htmlFor="username">Username</label>
        <input type="email" />
        <label htmlFor="password">password</label>
        <input type="password" name="" id="" />
    </form>
    </>
  )
}