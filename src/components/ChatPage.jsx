import { useEffect, useState, useReducer } from "react"
import axios from "axios"
import { io } from "socket.io-client"

import "../css_of_components/ChatPage.css"

import { MdDeleteForever } from "react-icons/md";

import { IoSend } from "react-icons/io5";

import { MdNavigateNext } from "react-icons/md";

import { FaImages } from "react-icons/fa";

function ChatPage() {

	const socket = io("http://127.0.0.1:5000")

	// Path to images and videos so user can see it
	const pathToImagesAndVideos = "../src/backend/"

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	const chatName = sessionStorage.getItem("nameOfChat")

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// Password of logged user
	const password = credentialsParsed.password

	// Force update to the page when its neccesary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	const [chatAdmins, setChatAdmins] = useState()

	const [performAdminActions, setPerformAdminActions] = useState(false)

	const [extraInfoOfChat, setExtraInfoOfChat] = useState()

	const [savedMessages, setSavedMessages] = useState([])

	const [imagesToSee, setImagesToSee] = useState([])
	const [indexOfImage, setIndexOfImage] = useState(0)

	/* All images user selected converted into base64 */
	const [userImagesBase64, setUserImagesBase64] = useState([])

	/* All videos user selected converted into base64 */
	const [userVideosBase64, setUserVideosBase64] = useState([])

	const [idWasAlreadySended, setIdWasAlreadySended] = useState(false)

	useEffect(() => {

		axios.get(`${serverAddress}show-messages-to-user`, { params: { chatName: chatName } }).then(res => {

			let infoOfChatNoUsestate = { id: res.data[0], title: res.data[1], members: [] }

			for (let index = 0; index < res.data[2].length; index++) {

				infoOfChatNoUsestate.members.push([res.data[2][index], "noAdmin"])

			}


			for (let index = 0; index < res.data[4].length; index++) {

				for (let index2 = 0; index2 < infoOfChatNoUsestate.members.length; index2++) {

					if (res.data[4][index] === infoOfChatNoUsestate.members[index2][0]) {

						infoOfChatNoUsestate.members.splice(index2, 1, [infoOfChatNoUsestate.members[index2][0], "admin"])

					}

				}

			}

			setExtraInfoOfChat(infoOfChatNoUsestate)

			if (res.data[3] !== null) {

				for (let index = 0; index < res.data[3].length; index++) {

					setSavedMessages(prevState => [...prevState, JSON.parse(res.data[3][index])])

				}

			}

		})

	}, [])

	window.scrollTo(window.innerHeight, window.innerHeight)

	useEffect(() => {

		if (idWasAlreadySended === false && extraInfoOfChat !== undefined) {

			socket.emit("joinRoom", extraInfoOfChat.id)

			setTimeout(() => {

				setIdWasAlreadySended(true)

			}, 1000)

		}

	}, [extraInfoOfChat, idWasAlreadySended])

	const sendNewMessage = () => {

		const text = document.getElementById("text-of-message").value

		socket.emit("sendMessage", { idOfChat: extraInfoOfChat.id, username: username, password: password, text: text, imagesBase64: userImagesBase64, videosBase64: userVideosBase64 })

		document.getElementById("text-of-message").value = ""

		setUserImagesBase64([])

		setUserVideosBase64([])

		setImagesToSee([])

		forceUpdate()

	}

	const displayImagesAndVideos = (imageOrVideo) => {

		// Do a for loop for each image or video in the array of images
		for (let index = 0; index < imageOrVideo.target.files.length; index++) {

			// Create a new file reader
			let reader = new FileReader()

			// If the file is a image do this
			if (imageOrVideo.target.files[index].type.includes("image")) {

				// Put the image url in imagesToSee so user can see it
				setImagesToSee(prevState => [...prevState, ["image", URL.createObjectURL(imageOrVideo.target.files[index])]])

				// Read image as dataUrl
				reader.readAsDataURL(imageOrVideo.target.files[index])

				reader.onload = function () {

					// Put the base64 image into userImagesBase64 so it can be send it to backend
					setUserImagesBase64(prevState => [...prevState, reader.result])

				}

			}

			// If file is video do this
			else if (imageOrVideo.target.files[index].type.includes("video")) {

				// Put the video in imagesToSee so user can see it
				setImagesToSee(prevState => [...prevState, ["video", URL.createObjectURL(imageOrVideo.target.files[index])]])

				// Read video as data url
				reader.readAsDataURL(imageOrVideo.target.files[index])

				reader.onload = function () {

					// Put video in videosBase64 so it can be send to backend
					setUserVideosBase64(prevState => [...prevState, reader.result])

				}

			}

		}

	}

	socket.on("receiveMessage", message => {

		savedMessages.push(JSON.parse(message))

		forceUpdate()

	})

	const incrementIndex = () => {

		if (indexOfImage + 1 < imagesToSee.length) {

			setIndexOfImage(indexOfImage + 1)

		}

	}

	const decreaseIndex = () => {

		if (indexOfImage - 1 > -1) {

			setIndexOfImage(indexOfImage - 1)

		}

	}

	const deleteFile = (file, type) => {

		setImagesToSee(imagesToSee.filter(fileToFilter => fileToFilter !== file))

		if (type === "image") {

			userImagesBase64.splice(indexOfImage, 1)

		}

		else if (type === "video") {

			userVideosBase64.splice(indexOfImage, 1)

		}

		if (indexOfImage - 1 > 0) {

			setIndexOfImage(indexOfImage - 1)

		} else if (indexOfImage - 1 === 0 || indexOfImage - 1 < 0) {

			setIndexOfImage(0)

		}

	}

	const banUser = (usernameOFBannedUser) => {

		axios.post(`${serverAddress}ban-user-from-chat-page`, {
			params: {
				usernameOfBannedUser: usernameOFBannedUser,
				adminUsername: username, adminPassword: password,
				idOfChat: extraInfoOfChat.id
			}
		})

	}

	const giveToUserAdminPriviliges = (usernameOfNewAdmin) => {

		axios.post(`${serverAddress}change-privileges-of-user-in-chat`, {
			params: {
				usernameOfNewAdmin: usernameOfNewAdmin,
				adminUsername: username, adminPassword: password,
				idOfChat: extraInfoOfChat.id
			}
		})

	}

	return (

		<div>

			<div id="parent-main-div">

				{imagesToSee.length === 0 &&
					<div id="child-main-div">


						<div id="messages-div">

							<button id="go-back-button-chat-page" onClick={() => window.location.href = `${localAddress}main-page/browse-chats`}>Go back</button>

							<div id="admin-actions-general-div">

								{performAdminActions === true && <>
									<h2>Admin Actions</h2>

									<button onClick={() => setPerformAdminActions(false)}>Hide admin actions</button>
								</>}

								{extraInfoOfChat?.members.map(member => {

									return (

										<div id="perform-admin-actions-div">

											{member[0] === username && member[1] === "admin" && performAdminActions === false && <button id="perform-admin-actions-button" onClick={() => setPerformAdminActions(true)}>Perform admin actions</button>}

											{performAdminActions === true &&

												<>

													<h2>{member[0]}</h2>

													{member[1] !== "admin" ?

														<>

															<button onClick={() => banUser(member[0])}>Ban this user</button>

															<button onClick={() => giveToUserAdminPriviliges(member[0])}>Make this user an admin</button>

														</>

														:

														<h3>This user is an admin</h3>

													}

													<hr></hr>

												</>

											}

										</div>

									)

								})}


								{savedMessages !== null ?

									savedMessages.map((messageInfo) => {

										if (messageInfo.indexOfMultimedia === undefined) {

											Object.assign(messageInfo, { indexOfMultimedia: 0 })

										}

										const incrementIndex = () => {

											/* If index is less than the multimedia length change index */
											if (messageInfo.indexOfMultimedia + 1 < messageInfo.image_and_videos_path.length) {

												Object.assign(messageInfo, { indexOfMultimedia: messageInfo.indexOfMultimedia + 1 })

												forceUpdate()

											}

										}

										const decreaseIndex = () => {

											if (messageInfo.indexOfMultimedia - 1 > -1) {

												Object.assign(messageInfo, { indexOfMultimedia: messageInfo.indexOfMultimedia - 1 })

												forceUpdate()

											}

										}

										return (

											<div>

												<h3>{JSON.parse(messageInfo.stringified_message)[0]}: {JSON.parse(messageInfo.stringified_message)[1]}</h3>

												{messageInfo.image_and_videos_path.length > 0 &&

													<>

														{messageInfo.image_and_videos_path[messageInfo.indexOfMultimedia][0] === "image" && <img onClick={() => window.open(pathToImagesAndVideos + messageInfo.image_and_videos_path[messageInfo.indexOfMultimedia][1])} id="image-of-chat" src={pathToImagesAndVideos + messageInfo.image_and_videos_path[messageInfo.indexOfMultimedia][1]}></img>}

														{messageInfo.image_and_videos_path[messageInfo.indexOfMultimedia][0] === "video" && <video width="500" controls src={pathToImagesAndVideos + messageInfo.image_and_videos_path[messageInfo.indexOfMultimedia][1]}></video>}


													</>

												}

												{messageInfo.image_and_videos_path.length > 1 &&

													<>

														{messageInfo.indexOfMultimedia !== 0 &&
															<MdNavigateNext id="previous-image-chat" onClick={decreaseIndex}>Previous</MdNavigateNext>
														}

														{messageInfo.image_and_videos_path.length - 1 > messageInfo.indexOfMultimedia &&
															<MdNavigateNext id="next-image-chat" onClick={incrementIndex}>Next</MdNavigateNext>
														}


													</>

												}

											</div>

										)

									})

									:

									<h2>No messages yet</h2>

								}

								<br></br>

							</div>
						</div>


					</div>

				}
			</div>

			{imagesToSee.length === 0 ?

				<div id="cool-effect-chat-page">

					<div id="child-of-cool-effect-chat-page">

						<input id="select-files-input-chat" type="file" multiple onChange={(event) => displayImagesAndVideos(event)}></input>

						<div id="div-send-button-input-message">

							<textarea id="text-of-message" placeholder="Type your message here..."></textarea>

							<IoSend id="send-message-button-no-image-mode" onClick={sendNewMessage}></IoSend>

						</div>

					</div>

				</div>

				:

				<div id="div-for-displaying-images">

					<button onClick={() => {
						setImagesToSee([])
						setUserVideosBase64([])
						setUserImagesBase64([])
					}} id="cancel-upload-image-chat">Cancel</button>

					{imagesToSee.length > 0 &&

						<>

							{imagesToSee[indexOfImage][0] === "video" && <video width="300" src={imagesToSee[indexOfImage][1]} controls></video>}

							{imagesToSee[indexOfImage][0] === "image" && <img onClick={(event) => { window.open(event.target.src) }} id="img-container-send-chat" width="500" src={imagesToSee[indexOfImage][1]}></img>}

							{imagesToSee.length > 1 &&

								<div id="next-previous-image-div-chat">

									<MdNavigateNext id="previous-image-chat" onClick={decreaseIndex}>Previous</MdNavigateNext>

									<MdNavigateNext id="next-image-chat" onClick={incrementIndex}>Next</MdNavigateNext>

								</div>

							}

							<MdDeleteForever id="delete-file-button" onClick={() =>
								deleteFile(
									imagesToSee[indexOfImage],
									imagesToSee[indexOfImage][0] === "image" ? "image" : "video"
								)}></MdDeleteForever >

						</>

					}

					<div id="message-and-upload-archive-div">

						<div id="upload-image-div">

							<label>

								<input id="select-files-input-chat-send-image" type="file" multiple onChange={(event) => displayImagesAndVideos(event)}></input>

								<FaImages id="upload-image-video-button"></FaImages>

							</label>

						</div>

						<textarea id="text-of-message" placeholder="Type your message here..."></textarea>

						<IoSend id="send-message-button" onClick={sendNewMessage}></IoSend>

					</div>

				</div>

			}

		</div>

	)

}

export default ChatPage
