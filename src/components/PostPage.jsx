import { useEffect, useState } from "react"

import axios from "axios"

import { FaImages } from "react-icons/fa";

import "../css_of_components/PostPage.css"

function PostPage() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// Password of logged user
	const password = credentialsParsed.password

	// Here will be stored the type of publication user wants to use
	const [userChoosedTypeOfPost, setUserChoosedTypeOfPost] = useState("")

	/* All the images and videos user choosed are here for being displayed */
	const [userMultimedia, setUserMultimedia] = useState([])

	/* All images user selected converted into base64 */
	const [userImagesBase64, setUserImagesBase64] = useState([])

	/* All videos user selected converted into base64 */
	const [userVideosBase64, setUserVideosBase64] = useState([])

	// Index of user to see images and videos
	const [userMultimediaIndex, setUserMultimediaIndex] = useState(0)

	// Community user wants to publish
	const communityUserWantsToPost = sessionStorage.getItem("communityNameToPost")

	// All communities user is following
	const [communitiesUserIsFollowing, setCommunitiesUserIsFollowing] = useState([])

	const [warnUser, setWarnUser] = useState("")

	useEffect(() => {

		axios.get(`${serverAddress}send-community-user-is-following`, { params: { username: username } }).then(res => {

			setCommunitiesUserIsFollowing(res.data)

		})

	}, [])

	const sendTextPostToBackend = () => {

		const title = document.getElementById("title-post-text-option").value

		const body = document.getElementById("body-post-text-option").value

		if (title.length > 0 && body.length > 0) {

			// Send info about text post to backend
			axios.post(`${serverAddress}create-post`, {
				params: {

					typeOfPost: "text",

					title: title,

					body: body,

					author: username,

					password: password,

					community: document.getElementById("community-of-post").value

				}
			})

		} else if (title.length === 0) {

			setWarnUser("invalidTitle")

		} else if (body.length === 0) {

			setWarnUser("invalidBody")

		}

	}

	const sendImageVideoPostToBackend = () => {

		// Send info about image and video post to backend
		axios.post(`${serverAddress}create-post`, {
			params: {

				typeOfPost: "imageVideo",

				title: document.getElementById("title-post-imageVideo-option").value,

				body: "imageVideosPublication",

				images: userImagesBase64,

				videos: userVideosBase64,

				author: username,

				password: password,

				community: document.getElementById("community-of-post-image-video").value

			}
		})

	}

	const displayImagesAndVideos = (imageOrVideo) => {

		// Do a for loop for each image or video in the array of images
		for (let index = 0; index < imageOrVideo.target.files.length; index++) {

			// Create a new file reader
			let reader = new FileReader()

			// If the file is a image do this
			if (imageOrVideo.target.files[index].type.includes("image")) {

				// Put the image url in userMultimedia so user can see it
				setUserMultimedia(prevState => [...prevState, ["image", URL.createObjectURL(imageOrVideo.target.files[index])]])

				// Read image as dataUrl
				reader.readAsDataURL(imageOrVideo.target.files[index])

				reader.onload = function () {

					// Put the base64 image into userImagesBase64 so it can be send it to backend
					setUserImagesBase64(prevState => [...prevState, reader.result])

				}

			}

			// If file is video do this
			else if (imageOrVideo.target.files[index].type.includes("video")) {

				// Put the video in userMultimedia so user can see it
				setUserMultimedia(prevState => [...prevState, ["video", URL.createObjectURL(imageOrVideo.target.files[index])]])

				// Read video as data url
				reader.readAsDataURL(imageOrVideo.target.files[index])

				reader.onload = function () {

					// Put video in videosBase64 so it can be send to backend
					setUserVideosBase64(prevState => [...prevState, reader.result])

				}

			}

		}

	}

	const incrementIndex = () => {

		if (userMultimediaIndex + 1 < userMultimedia.length) {

			setUserMultimediaIndex(userMultimediaIndex + 1)

		}

	}

	const decreaseIndex = () => {

		if (userMultimediaIndex - 1 > -1) {

			setUserMultimediaIndex(userMultimediaIndex - 1)

		}

	}

	const deleteFile = (file, type) => {

		setUserMultimedia(userMultimedia.filter(fileToFilter => fileToFilter !== file))

		if (type === "image") {

			userImagesBase64.splice(userMultimediaIndex, 1)

		}

		else if (type === "video") {

			userVideosBase64.splice(userMultimediaIndex, 1)

		}

		if (userMultimediaIndex - 1 > 0) {

			setUserMultimediaIndex(userMultimediaIndex - 1)

		} else if (userMultimediaIndex - 1 === 0 || userMultimediaIndex - 1 < 0) {

			setUserMultimediaIndex(0)

		}

	}

	return (

		<div id="main-div-post-page">

			<div id="child-div-post-page">

				{/* Buttons to see what user wants */}
				<button id="post-type-text-button" onClick={() => setUserChoosedTypeOfPost("textPost")}>Text</button>

				<button id="post-type-image-button" onClick={() => setUserChoosedTypeOfPost("imageVideoPost")}>Images, videos</button>

				{userChoosedTypeOfPost === "textPost" &&

					<div id="post-div">

						{/* Title option */}
						<h2>Title</h2>

						<textarea placeholder="Title of your post" id="title-post-text-option"></textarea>

						{/* Body of publication option */}
						<h2>Body</h2>

						<textarea placeholder="Body of your post" id="body-post-text-option"></textarea>

						<h2>Community</h2>

						<select id="community-of-post" defaultValue={communityUserWantsToPost}>

							{communitiesUserIsFollowing !== "noCommunitiesFollowed" && communitiesUserIsFollowing.map(community => {

								return (

									<option>{community}</option>

								)

							})}

						</select>

						<br></br>

						{/* Submit text post! */}
						<button id="submit-post-button" onClick={sendTextPostToBackend}>Submit</button>

					</div>

				}

				{userChoosedTypeOfPost === "imageVideoPost" &&

					<div id="post-div">

						{/* Title option */}
						<h2>Title</h2>

						<textarea id="title-post-imageVideo-option"></textarea>

						{/* Image or video of publication option */}
						<h2>Image or video</h2>

						{userMultimedia.length > 0 &&

							<>

								{userMultimedia[userMultimediaIndex][0] === "video" && <video width="300" src={userMultimedia[userMultimediaIndex][1]} controls></video>}

								{userMultimedia[userMultimediaIndex][0] === "image" && <img width="500" id="post-page-image" src={userMultimedia[userMultimediaIndex][1]}></img>}

								{userMultimedia.length > 1 &&

									<>

										<button onClick={incrementIndex}>Next</button>

										<button onClick={decreaseIndex}>Previous</button>

									</>

								}

								<button onClick={() =>
									deleteFile(
										userMultimedia[userMultimediaIndex],
										userMultimedia[userMultimediaIndex][0] === "image" ? "image" : "video"
									)}>Delete this File</button>

							</>

						}

						<label id="label-upload-image">

							{/* This input handle files so it can be interpreted by the displayImagesAndVideos function */}
							<input id="upload-file-in-post-page" onChange={(event) => displayImagesAndVideos(event)} type="file" multiple></input>

							<FaImages id="upload-image-video-button"></FaImages>

						</label>


						<h2>Community</h2>

						<select id="community-of-post-image-video">

							{communitiesUserIsFollowing.map(community => {

								return (

									<option>{community}</option>

								)

							})}

						</select>

						<br></br>

						{/* Submit button to backend server */}
						<button id="submit-post-button" onClick={sendImageVideoPostToBackend}>Submit</button>

					</div>

				}

				{warnUser === "invalidTitle" && <h2>Invalid title of post</h2>}

				{warnUser === "invalidBody" && <h2>Invalid body of post</h2>}

				{communitiesUserIsFollowing === "noCommunitiesFollowed" && <h2>You are not subscribed to a community try join one, and create a post</h2>}

			</div>

		</div >

	)

}



export default PostPage
