import axios from "axios"

import { useState, useEffect, useReducer } from "react"

import "../css_of_components/CreateCommunityPage.css"

import { FaFileImage } from "react-icons/fa";

function CreateCommunityPage() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// All the communities where user is admin
	const [communitiesWhereUserIsAdmin, setCommunitiesWhereUserIsAdmin] = useState([])

	const [communitiesWhereUserIsModerator, setCommunitiesWhereUserIsModerator] = useState([])

	/* All the images and videos user choosed are here for being displayed */
	const [userMultimedia, setUserMultimedia] = useState("")

	/* All images user selected converted into base64 */
	const [userImagesBase64, setUserImagesBase64] = useState("")

	const [filterBy, setFilterBy] = useState("admin")

	const [warnUser, setWarnUser] = useState("")

	// Force update to the page when its neccesary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	/* Send community info to backend for creating it */
	const createCommunity = () => {

		if (userImagesBase64.length > 0 && document.getElementById("name-of-community").value.length > 0 && document.getElementById("description-of-community").value.length > 0 &&
			document.getElementById("rules-of-community").value.length > 0) {

			axios.post(`${serverAddress}create-community`, {
				params: {
					nameOfCommunity: document.getElementById("name-of-community").value,
					descriptionOfCommunity: document.getElementById("description-of-community").value,
					rulesOfCommunity: document.getElementById("rules-of-community").value,
					admin: username,
					iconBase64: userImagesBase64,
				}
			})

			setTimeout(() => {

				axios.get(`${serverAddress}show-created-communities-to-admins`, { params: { username: username } }).then(res => {

					setCommunitiesWhereUserIsAdmin(res.data)

				})

			}, 2000)

		} else {

			setWarnUser("invalid")

		}

	}

	useEffect(() => {

		axios.get(`${serverAddress}show-created-communities-to-admins`, { params: { username: username } }).then(res => {

			setCommunitiesWhereUserIsAdmin(res.data)

		})

		axios.post(`${serverAddress}show-communities-where-user-is-moderator`, { params: { username: username } }).then(res => {

			setCommunitiesWhereUserIsModerator(res.data)

		})

	}, [])

	const displayImagesAndVideos = (imageOrVideo) => {

		// Create a new file reader
		let reader = new FileReader()

		// If the file is a image do this
		if (imageOrVideo.target.files[0].type.includes("image")) {

			// Put the image url in userMultimedia so user can see it
			setUserMultimedia(URL.createObjectURL(imageOrVideo.target.files[0]))

			// Read image as dataUrl
			reader.readAsDataURL(imageOrVideo.target.files[0])

			reader.onload = function () {

				// Put the base64 image into userImagesBase64 so it can be send it to backend
				setUserImagesBase64(reader.result)

			}

		}

	}

	return (

		<div id="main-div-create-community">

			<div id="cool-effect-create-community-page">

				<h1 id="create-community-title">Create a community!</h1>

			</div>

			<div id="community-name-desc-rules-div">

				<h2>Name of your community</h2>

				<input id="name-of-community" placeholder="name of your community"></input>


				<h2>Description of your community</h2>

				<input id="description-of-community" placeholder="description of your community"></input>


				<h2>Rules of your community</h2>

				<input id="rules-of-community" placeholder="rules of this community"></input>

				<h2>Icon of your community</h2>


				<img width="200" src={userMultimedia}></img>

				<label>

					<input id="hide-file-input-community-icon" type="file" onChange={(event) => displayImagesAndVideos(event)}></input>

					<FaFileImage id="upload-community-file-icon"></FaFileImage>

				</label>

				{userMultimedia.length > 0 && <button onClick={() => {

					setUserMultimedia("")

					setUserImagesBase64("")

				}}>Delete icon of community</button>}

				<br></br>

				<button id="create-community-button" onClick={createCommunity}>Create community</button>

				{warnUser === "invalid" && <> <h2>Some of your data is incorrect</h2>

					<button onClick={() => setWarnUser("")}>I understand this message</button>

				</>}

			</div>


			<div id="filter-and-admin-moderator-of-div">

				<h2>Filter by</h2>

				<button id="filter-by-admin" onClick={() => setFilterBy("admin")}>Communities where you are an admin</button>

				<button id="filter-by-moderator" onClick={() => setFilterBy("moderator")}>Communities where you are an moderator</button>

				{communitiesWhereUserIsAdmin.length > 0 && communitiesWhereUserIsAdmin !== "adminOfNone" && filterBy === "admin" &&

					<>

						<h1>You are admin in</h1>

						{communitiesWhereUserIsAdmin.map(community => {

							if (community.addAdmins === undefined && community.removeAdmins === undefined &&
								community.isUserModerator === undefined && community.isUserAdmin === undefined &&
								community.userNotExists === undefined && community.changePrivileges === undefined) {

								Object.assign(community, { addAdmins: false, removeAdmins: false, changePrivileges: false, isUserModerator: false, isUserAdmin: false, userNotExists: false })

							}

							const addPrivilegesToUser = (username, typeOfPrivilege) => {

								axios.post(`${serverAddress}add-admin-or-moderator`, { params: { username: username, typeOfPrivilege: typeOfPrivilege, communityName: community[1] } }).then(res => {

									if (res.data === "noProfileWithThisName") {

										Object.assign(community, { userNotExists: true })

										forceUpdate()

										setTimeout(() => {

											Object.assign(community, { userNotExists: false })

											forceUpdate()

										}, 3000)

									} else if (res.data === "alreadyAdmin") {

										Object.assign(community, { isUserAdmin: true })

										forceUpdate()

										setTimeout(() => {

											Object.assign(community, { isUserAdmin: false })

											forceUpdate()

										}, 3000)

									} else if (res.data === "alreadyModerator") {

										Object.assign(community, { isUserModerator: true })

										forceUpdate()

										setTimeout(() => {

											Object.assign(community, { isUserModerator: false })

											forceUpdate()

										}, 3000)

									}

								})

							}

							const removePrivileges = (username) => {

								axios.post(`${serverAddress}remove-admin-or-moderator`, { params: { username: username, communityName: community[1] } })

							}

							const changePrivileges = (username, typeOfPrivilege) => {

								axios.post(`${serverAddress}change-privileges-to-moderator-or-admin`, {
									params: {
										username: username, typeOfPrivilege: typeOfPrivilege,
										communityName: community[1]
									}
								}).then(res => {

									if (res.data === "alreadyModerator") {

										Object.assign(community, { isUserModerator: true })

										forceUpdate()

										setTimeout(() => {

											Object.assign(community, { isUserModerator: false })

											forceUpdate()

										}, 3000)

									}

									else if (res.data === "alreadyAdmin") {

										Object.assign(community, { isUserAdmin: true })

										forceUpdate()

										setTimeout(() => {

											Object.assign(community, { isUserAdmin: false })

											forceUpdate()

										}, 3000)

									}
									else if (res.data === "userIsNotCommunityMember") {

										Object.assign(community, { userNotCommunityMember: true })

										forceUpdate()

										setTimeout(() => {

											Object.assign(community, { userNotCommunityMember: false })

											forceUpdate()

										}, 3000)

									}

								})

							}

							return (

								<div key={community[1]} id="admin-of-div">

									<h2>Name</h2>

									<h3>{community[1]}</h3>

									<h2>Admins</h2>

									{community[3].map(admin => {

										return (

											<>

												<h3>{admin}</h3>

											</>

										)

									})}

									<h2>Moderators</h2>

									{community[4]?.map(moderator => {

										return (

											<>

												<h3>{moderator}</h3>

											</>

										)

									})}

									<br></br>

									<div id="options-for-admin-moderator-div">

										<button id="add-admins-button" onClick={() => {

											Object.assign(community, { addAdmins: true, removeAdmins: false, changePrivileges: false })

											forceUpdate()

										}}>Add admins</button>

										<button id="remove-admins-button" onClick={() => {

											Object.assign(community, { removeAdmins: true, addAdmins: false, changePrivileges: false })


											forceUpdate()

										}}>Remove admins</button>

										<button id="change-privileges-button" onClick={() => {

											Object.assign(community, { changePrivileges: true, removeAdmins: false, addAdmins: false })

											forceUpdate()

										}}>Change privileges</button>

										<br></br>

										{community.addAdmins === true &&

											<>

												<button id="close-window-button" onClick={() => {

													Object.assign(community, { addAdmins: false })

													forceUpdate()

												}}>Close this window</button>

												<br></br>

												<input id="name-of-future-admin-or-moderator" placeholder="Profile username"></input>

												<br></br>

												<button id="add-as-admin" onClick={() => addPrivilegesToUser(document.getElementById("name-of-future-admin-or-moderator").value, "admin")}>Add as admin</button>

												<button id="add-as-moderator" onClick={() => addPrivilegesToUser(document.getElementById("name-of-future-admin-or-moderator").value, "moderator")}>Add as moderator</button>

											</>

										}


										{community.removeAdmins === true &&

											<>

												<button id="close-window-button" onClick={() => {

													Object.assign(community, { removeAdmins: false })

													forceUpdate()

												}}>Close this window</button>

												<br></br>

												<input id="admin-to-ban" placeholder="Profile Username"></input>

												<br></br>

												<button id="remove-admin-moderator" onClick={() => removePrivileges(document.getElementById("admin-to-ban").value)}>Remove</button>

											</>

										}

										{community.changePrivileges === true &&

											<>

												<button id="close-window-button" onClick={() => {

													Object.assign(community, { changePrivileges: false })

													forceUpdate()

												}}>Close this window</button>

												<br></br>

												<input id="profile-to-change-privileges" placeholder="Profile Username"></input>

												<br></br>

												<button id="change-privileges-to-moderator" onClick={() => changePrivileges(document.getElementById("profile-to-change-privileges").value, "moderator")}>Change to moderator</button>

												<button id="change-privileges-to-admin" onClick={() => changePrivileges(document.getElementById("profile-to-change-privileges").value, "admin")}>Change to admin</button>

											</>

										}

										{community.isUserAdmin === true && <h2>This user is already an admin</h2>}

										{community.isUserModerator === true && <h2>This user is already an moderator</h2>}

										{community.userNotExists === true && <h2>This username don't exist try another</h2>}

										{community.userNotCommunityMember === true && <h2>This profile is not a community member add him...</h2>}

									</div>


								</div>

							)

						})
						}
					</>

				}


				{communitiesWhereUserIsModerator.length > 0 && filterBy === "moderator" &&

					<>

						<h1>You are a moderator in:</h1>

						{communitiesWhereUserIsModerator.map(community => {

							return (

								<div key={community[1]}>

									<hr></hr>

									<h2>{community[1]}</h2>

									<h3>admins:</h3>

									<h3>{community[3].map(admins => {

										return (

											<h3 key={admins}>{admins}</h3>

										)

									})}</h3>

									<h3>moderators:</h3>

									<h3>{community[4].map(moderators => {

										return (

											<h3 key={moderators}>{moderators}</h3>

										)

									})}</h3>

								</div>

							)

						})}

					</>

				}

			</div>

		</div>

	)

}

export default CreateCommunityPage
