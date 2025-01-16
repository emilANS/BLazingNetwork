import { useState } from "react"

import axios from "axios"

import "../css_of_components/RegisterPage.css"

function RegisterPage() {

	// Backend address
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	const [errors, setErrors] = useState("")

	const [userProfileImageBase64, setUserProfileImageBase64] = useState("noImage")

	const [userProfileImage, setUserProfileImage] = useState()

	const sendCredentialsToRegister = () => {

		// Sending credentials to backend to create account
		axios.post(`${serverAddress}register-user`, {
			params: {

				username: document.getElementById("username-input").value,

				email: document.getElementById("email-input-register").value,

				password: document.getElementById("password-input").value,

				profileImage: userProfileImageBase64

			}
		}).then(res => {

			if (res.data === "Sended!") {

				// If user created a account with no errors go to login page
				window.location.href = `${localAddress}`

			} else {

				// Indicate user what are their errors
				setErrors(res.data)

			}

		})

	}

	const uploadProfileImage = (image) => {

		let reader = new FileReader

		if (image.target.files[0].type.includes("image")) {

			setUserProfileImage(URL.createObjectURL(image.target.files[0]))

			reader.readAsDataURL(image.target.files[0])

			reader.onload = () => {

				setUserProfileImageBase64(reader.result)

			}

		}

	}

	return (

		<div id="register-div">

			<h1 id="register-welcome-text">Register page</h1>

			{/* Getting credentials from user to send to register in database */}


			{userProfileImageBase64 !== "noImage" ?

				<>

					<img id="preview-of-user-profile-image" width="200" src={userProfileImage}></img>

					<input id="select-profile-image-input" onChange={(event) => uploadProfileImage(event)} type="file"></input>

					<button id="choose-profile-image-register-button" onClick={() => {

						setUserProfileImageBase64("noImage")

					}}>I don't want a profile image</button>

				</>

				:

				<>

					<h2>Do you want a profile image?</h2>

					<button id="choose-profile-image-register-button" onClick={() => {

						setUserProfileImageBase64("")

					}}>Yes i want a profile image</button>

				</>


			}

			<h2>Username</h2>

			<input id="username-input" placeholder="your username"></input>

			<div id="linear-gradient-cool-effect-register">

				<h2>Email</h2>

				<input id="email-input-register" placeholder="Your email"></input>

			</div>

			<h2>Password</h2>

			<input id="password-input" placeholder="your password"></input>

			<br></br>


			<br></br>

			<button id="submit-login" onClick={sendCredentialsToRegister}>Register</button>

			{/* A button to redirect user to login page */}

			<button id="go-to-login" onClick={() => {

				window.location.href = `${localAddress}`

			}}>Go to login</button>

			{errors === "checkIfInputsAreEmpty" && <h2>Some or one of your input are empty</h2>}

			{errors === "credentialsAlreadyExist" && <h2>Your credentials already exists</h2>}

			{errors === "usernameAlreadyExists" && <h2>This username already exists</h2>}

			{errors === "emailAlreadyExists" && <h2>This email already exists</h2>}

			{errors === "noValidProfileImage" && <h2>You have enter a not valid profile image</h2>}

		</div>

	)

}

export default RegisterPage
