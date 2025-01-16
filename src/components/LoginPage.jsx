import { useState } from "react"

import "../css_of_components/LoginPage.css"

import axios from "axios"

function LoginPage() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// Errors useState
	const [errors, setErrors] = useState("")

	const loginUser = () => {

		// Sending credentials to backend to verify if are correct and send user to main page
		axios.post(`${serverAddress}login-user`, {
			params: {

				username: document.getElementById("username-input").value,

				email: document.getElementById("email-input").value,

				password: document.getElementById("password-input").value

			}
		}).then(res => {

			if (res.data === "correct") {

				// If user put a correct credential make him enter to the main page
				window.location.href = `${localAddress}main-page`

				sessionStorage.setItem("userIsAuthenticated", "ok!")

				sessionStorage.setItem("userCredentials", JSON.stringify({ username: document.getElementById("username-input").value, password: document.getElementById("password-input").value }))

			} else {

				// If user puts incorrect credentials advice him
				setErrors("incorrectCredentials")

			}

		})

	}

	return (

		<div id="login-div">


			<h1 id="login-welcome-text">Login page</h1>

			{/* Getting all user credentials to send it to backend to see if it is authentic */}

			<h2>Username</h2>

			<input id="username-input" placeholder="Your username"></input>

			<div id="linear-gradient-cool-effect">

				<h2>Email</h2>

				<input id="email-input" placeholder="Your email"></input>

			</div>

			<h2>Password</h2>

			<input id="password-input" placeholder="Your password"></input>

			<br></br>

			<button id="submit-login" onClick={loginUser}>Login</button>

			{/* A button to redirect user to register page */}

			<button id="go-to-register" onClick={() => {

				window.location.href = `${localAddress}register`

			}}>Go to register</button>

			{/* Advice user of Errors */}
			{errors === "incorrectCredentials" && <h2>Invalid Credentials</h2>}

		</div>

	)

}

export default LoginPage

