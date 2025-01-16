import { useEffect, useState, useReducer } from "react"
import axios from "axios"

import "../css_of_components/ProfileSettings.css"

import { FaImages } from "react-icons/fa";

function profileSettings() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	let username = credentialsParsed.username

	// Password of logged user
	const password = credentialsParsed.password

	// Force update to the page when its neccesary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	// Path to images and videos so user can see it
	const pathToImagesAndVideos = "../src/backend/"

	const [userProfileImageName, setUserProfileImageName] = useState("")

	const [userProfileImage, setUserProfileImage] = useState()

	const [newUserProfileImageBase64, setNewUserProfileImageBase64] = useState("")

	const [warnUser, setWarnUser] = useState("")

	useEffect(() => {

		axios.get(`${serverAddress}get-user-profile-image`, { params: { username: username } }).then(res => {

			setUserProfileImage(res.data)

			setUserProfileImageName(res.data)

		})

	}, [])

	const uploadProfileImage = (image) => {

		let reader = new FileReader

		if (image.target.files[0].type.includes("image")) {

			setUserProfileImage(URL.createObjectURL(image.target.files[0]))

			reader.readAsDataURL(image.target.files[0])

			reader.onload = () => {

				setNewUserProfileImageBase64(reader.result)

			}

		}

		setUserProfileImage(URL.createObjectUrl(image.target.files[0]))

	}

	const saveNewCredentials = () => {

		axios.post(`${serverAddress}change-user-credentials`, {
			params: {
				oldUsername: username,
				oldPassword: password,
				newUsername: document.getElementById("new-username").value,
				newEmail: document.getElementById("new-email").value,
				newPassword: document.getElementById("new-password").value
			}
		}).then(res => {

			if (res.data === "credentialsChanged") {

				sessionStorage.setItem("userCredentials", document.getElementById("new-username").value)

				username = document.getElementById("new-username").value

				setWarnUser("changedCredentialsSucessfully")

				setTimeout(() => {

					setWarnUser("")

					window.location.href = `${localAddress}`

				}, 3000)


			} else if (res.data == "invalidUsernameOrPassword") {

				setWarnUser("invalidOldPasswordOrUsername")

				setTimeout(() => {

					setWarnUser("")

				}, 3000)

			} else {

				setWarnUser("alreadyExistingUsername")

				setTimeout(() => {

					setWarnUser("")

				}, 3000)

			}

		})
	}

	const submitChangeProfileImage = () => {

		axios.post(`${serverAddress}change-profile-image`, { params: { newProfileImageBase64: newUserProfileImageBase64, username: username } })

		setNewUserProfileImageBase64("")

		forceUpdate()

	}

	return (

		<div>

			<div id="cool-effect-profile-settings"></div>

			<div id="profile-settings-main-div">

				<h1>Profile settings</h1>

				<h2 id="change-profile-image-text">Change profile image</h2>

				{userProfileImageName !== userProfileImage ?

					<img id="profile-image" width="300" src={userProfileImage}></img>

					:

					<img id="profile-image" width="300" src={pathToImagesAndVideos + userProfileImage}></img>

				}


				<div id="change-credentials-div">

					<label id="label-upload-image">

						<input id="input-profile-settings-change-image" onChange={(event) => uploadProfileImage(event)} type="file"></input>

						<FaImages id="upload-image-video-button"></FaImages>

					</label>


					{newUserProfileImageBase64 !== "" && <button onClick={submitChangeProfileImage}>Save profile image</button>}

					<h2>Change credentials</h2>

					<input id="new-username" placeholder="New username"></input>
					<input id="new-email" placeholder="New email"></input>
					<input id="new-password" placeholder="New password"></input>

					<button id="save-new-credentials-button" onClick={saveNewCredentials}>Save new credentials</button>

					{warnUser === "alreadyExistingUsername" && <h2>Already existing username</h2>}

					{warnUser === "changedCredentialsSucessfully" && <h2>Credentials changed! You will be redirected to Login Page</h2>}

					{warnUser === "invalidOldPasswordOrUsername" && <h2>Your password or username is invalid</h2>}

				</div>

			</div>

		</div >

	)

}

export default profileSettings
