import { useReducer, useState, useEffect } from "react"

import axios from "axios"

import "../css_of_components/SeePostPage.css"

import { BiUpvote, BiDownvote } from "react-icons/bi"

import { FaImage } from "react-icons/fa";

import { MdNavigateNext } from "react-icons/md";

function SeePostpage() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// Path to images and videos so user can see it
	const pathToImagesAndVideos = "../src/backend/"

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// Password of logged user
	const password = credentialsParsed.password

	// Force update to the page when its neccesary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	// All info about this post as title body image link video etc
	let [postInfo, setPostInfo] = useState(JSON.parse(sessionStorage.getItem("postInfoToSee")))

	// All comments of the post
	const [postComments, setPostComments] = useState([])

	const [postReplies, setPostReplies] = useState([])

	/* All images user selected converted into base64 */
	const [userImagesBase64, setUserImagesBase64] = useState([])

	/* All videos user selected converted into base64 */
	const [userVideosBase64, setUserVideosBase64] = useState([])

	/* All the images and videos user choosed are here for being displayed */
	const [userMultimedia, setUserMultimedia] = useState([])

	// Index of user to see images and videos
	const [userMultimediaIndex, setUserMultimediaIndex] = useState(0)

	/* If multimedia index don't exist create it! */
	if (postInfo.multimediaIndex === undefined) {

		Object.assign(postInfo, { multimediaIndex: 0 })

	}

	useEffect(() => {

		axios.get(`${serverAddress}show-comments`, { params: { idOfPost: postInfo[0] } }).then(res => {

			setPostComments(res.data)

		})

		axios.get(`${serverAddress}show-replies`, { params: { idOfPost: postInfo[0] } }).then(res => {

			setPostReplies(res.data)

		})

	}, [])

	/* Go to next image or video */
	const goToNextMultimedia = () => {

		/* If index is less than the list of images show the next file  */
		if (postInfo.multimediaIndex + 1 < JSON.parse(postInfo[3]).length) {

			Object.assign(postInfo, { multimediaIndex: postInfo.multimediaIndex + 1 })

			forceUpdate()

		}

	}

	/* Go to previous image or video */
	const goToPreviousMultimedia = () => {

		/* If index is greater than minus one show the previous file */
		if (postInfo.multimediaIndex - 1 > -1) {

			Object.assign(postInfo, { multimediaIndex: postInfo.multimediaIndex - 1 })

			forceUpdate()

		}

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

	const deleteFile = (file, type) => {

		/* Delete file with filter */
		setUserMultimedia(userMultimedia.filter(fileToFilter => fileToFilter !== file))

		/* If is type image delete from userImagesBase64 */
		if (type === "image") {

			userImagesBase64.splice(userMultimediaIndex, 1)

		}

		/* If is type video delete from userVideosBase64 */
		else if (type === "video") {

			userVideosBase64.splice(userMultimediaIndex, 1)

		}

		/* If user index minus one is greater than 0 rest 1 to the index */
		if (userMultimediaIndex - 1 > 0) {

			setUserMultimediaIndex(userMultimediaIndex - 1)

			/* If index is equal to 0 or less than 0 put index as 0 */
		} else if (userMultimediaIndex - 1 === 0 || userMultimediaIndex - 1 < 0) {

			setUserMultimediaIndex(0)

		}

	}

	const incrementIndex = () => {

		/* If index is less than the multimedia length change index */
		if (userMultimediaIndex + 1 < userMultimedia.length) {

			setUserMultimediaIndex(userMultimediaIndex + 1)

		}

	}

	const decreaseIndex = () => {

		/* If the index is greater than 0 change index */
		if (userMultimediaIndex - 1 > -1) {

			setUserMultimediaIndex(userMultimediaIndex - 1)

		}

	}

	const sendComment = () => {

		/* Send comment to backend database */
		axios.post(`${serverAddress}send-comment`, {
			params: {
				content: document.getElementById("comment-from-user").value,

				author: username,

				password: password,

				images: userImagesBase64,

				videos: userVideosBase64,

				idOfPost: postInfo[0],
			}
		}).then()

		/* In a second show comment user made */
		setTimeout(() => {

			axios.get(`${serverAddress}show-comments`, { params: { idOfPost: postInfo[0] } }).then(res => {

				setPostComments(res.data)

			})

		}, 1000)

	}

	const sendReply = (commentId, imagesBase64, videosBase64) => {

		/* Sending reply informtaion to backend */
		axios.post(`${serverAddress}send-reply`, {

			params: {

				content: document.getElementById("content-of-reply").value,

				author: username,

				password: password,

				images: imagesBase64,

				videos: videosBase64,

				idOfPost: postInfo[0],

				idOfComment: commentId,
			}

		})

		/* In 1 second make a request to show the reply user made */
		setTimeout(() => {

			axios.get(`${serverAddress}show-replies`, { params: { idOfPost: postInfo[0] } }).then(res => {

				setPostReplies(res.data)

			})

		}, 1000)

	}

	const sendLike = (id, typeOfOpinion) => {

		let statusOfRequest = null

		if (typeOfOpinion !== "post") {

			axios.post(`${serverAddress}send-like-to-${typeOfOpinion}`, { params: { id: id, username: username, password: password } }).then(res => { statusOfRequest = res.data })

		} else {

			axios.post(`${serverAddress}send-like-to-${typeOfOpinion}`, { params: { idOfPost: id, username: username, password: password, communityName: postInfo[5] } }).then(res => { statusOfRequest = res.data })

		}

		setTimeout(() => {


			if (statusOfRequest !== "alreadyLiked") {

				if (typeOfOpinion === "comment") {


					axios.get(`${serverAddress}show-comments`, { params: { idOfPost: postInfo[0] } }).then(res => {

						setPostComments(res.data)

					})



				} else if (typeOfOpinion === "reply") {


					axios.get(`${serverAddress}show-replies`, { params: { idOfPost: postInfo[0] } }).then(res => {

						setPostReplies(res.data)

					})


				} else if (typeOfOpinion === "post") {

					postInfo[4] = postInfo[4] + 1

					forceUpdate()

				}

			} else {

				Object.assign(postInfo, { alreadyLiked: true })

				forceUpdate()

				setTimeout(() => {

					Object.assign(postInfo, { alreadyLiked: false })

					forceUpdate()

				}, 3000)

			}

		}, 500)

	}

	const sendDislike = (id, typeOfOpinion) => {

		let statusOfRequest = null

		if (typeOfOpinion !== "post") {

			axios.post(`${serverAddress}send-dislike-to-${typeOfOpinion}`, { params: { id: id, username: username, password: password } }).then(res => { statusOfRequest = res.data })

		} else {

			axios.post(`${serverAddress}send-dislike-to-${typeOfOpinion}`, { params: { idOfPost: id, username: username, password: password } }).then(res => { statusOfRequest = res.data })

		}

		if (statusOfRequest !== "alreadyLiked") {

			if (typeOfOpinion === "comment") {

				setTimeout(() => {

					axios.get(`${serverAddress}show-comments`, { params: { idOfPost: postInfo[0] } }).then(res => {

						setPostComments(res.data)

					})

				}, 1000)

			} else if (typeOfOpinion === "reply") {

				setTimeout(() => {

					axios.get(`${serverAddress}show-replies`, { params: { idOfPost: postInfo[0] } }).then(res => {

						setPostReplies(res.data)

					})

				}, 1000)

			} else if (typeOfOpinion === "post") {

				postInfo[4] = postInfo[4] - 1

				forceUpdate()

			}

		} else {

			Object.assign(postInfo, { alreadyLiked: true })

			forceUpdate()

			setTimeout(() => {

				Object.assign(postInfo, { alreadyLiked: false })

				forceUpdate()

			}, 3000)

		}

	}

	return (

		<div>
			<div id="cool-effect-see-post-page"></div>

			<div id="main-div-see-post-page">

				<div id="body-of-post-div">

					{/* Community post is from */}
					<h3 onClick={() => {

						axios.get(`${serverAddress}get-user-id-by-username`, { params: { username: postInfo[6] } }).then(res => {

							if (username === postInfo[6]) {

								window.location.href = `${localAddress}main-page/profile-page`

							} else {

								sessionStorage.setItem("profileSearchedInfo", JSON.stringify([res.data, postInfo[6]]))

								window.location.href = `${localAddress}main-page/other-profile-page`

							}

						})

					}}>From {postInfo[6]}</h3>

					{/* If post is a image and video post show the images and videos */}
					{postInfo[2] === "imageAndVideoPost" ?

						<div>

							{/* If file is type image display as image */}
							{/* NOTE:  JSON.parse(postInfo[3])[postInfo.multimediaIndex][0] is the format of the file user choose with mutlimediaIndex in this case is image */}
							{JSON.parse(postInfo[3])[postInfo.multimediaIndex][0] === "image" && <img width="500" src={pathToImagesAndVideos + JSON.parse(postInfo[3])[postInfo.multimediaIndex][1]}></img>}

							{/* If file is type image display as image */}
							{/* NOTE:  JSON.parse(postInfo[3])[postInfo.multimediaIndex][0] is the format of the file user choose with mutlimediaIndex in this case is video */}
							{JSON.parse(postInfo[3])[postInfo.multimediaIndex][0] === "video" && <video width="300" src={pathToImagesAndVideos + JSON.parse(postInfo[3])[postInfo.multimediaIndex][1]} controls></video>}

							{postInfo.multimediaIndex !== JSON.parse(postInfo[3]).length - 1 && <button onClick={goToNextMultimedia}>Next</button>}

							{postInfo.multimediaIndex !== 0 && <button onClick={goToPreviousMultimedia}>Previous</button>}

						</div>

						:

						<>

							{/* Title of post */}
							<h2> {postInfo[2]}</h2>

						</>

					}

					<h3>{postInfo[4]}</h3>

					{postInfo.alreadyLiked === true && <h3>Already liked!</h3>}

					<div id="likes-div-see-post-page">

						<BiUpvote id="upvote-in-see-post-page" onClick={() => sendLike(postInfo[0], "post")}></BiUpvote>

						<BiDownvote id="downvote-in-see-post-page" onClick={() => sendDislike(postInfo[0], "post")}></BiDownvote>

					</div>

				</div>

				<div id="comments-section-div">

					<div id="submit-commentary-div">

						<textarea id="comment-from-user" placeholder="Your comment"></textarea>

						<label>

							<input id="hide-input-image-see-post-page" onChange={(event) => displayImagesAndVideos(event)} type="file" multiple></input>

							<FaImage id="image-upload-icon"></FaImage>

						</label>

						{userMultimedia.length > 0 &&

							<div>

								{/* Displaying images and videos */}
								{userMultimedia[userMultimediaIndex][0] === "video" && <video width="200" src={userMultimedia[userMultimediaIndex][1]} controls></video>}

								{userMultimedia[userMultimediaIndex][0] === "image" && <img id="image-see-post-page-commentary" src={userMultimedia[userMultimediaIndex][1]}></img>}

								{/* If user multimedia is greater than one show next and previous image or video option */}
								{userMultimedia.length > 1 &&

									<>

										<br></br>

										{userMultimediaIndex !== 0 &&

											<MdNavigateNext id="previous-image-see-post-page" onClick={decreaseIndex}></MdNavigateNext>

										}

										{userMultimedia.length - 1 !== userMultimediaIndex &&

											<MdNavigateNext id="next-image-see-post-page" onClick={incrementIndex}></MdNavigateNext>

										}

									</>

								}

								<br></br>

								{/* Delete image or video */}
								<button id="delete-file-see-post-page" onClick={() =>
									deleteFile(
										userMultimedia[userMultimediaIndex],
										userMultimedia[userMultimediaIndex][0] === "image" ? "image" : "video"
									)}>Delete this File</button>

							</div>

						}

						{/* Send comment */}
						<button id="send-comment-button" onClick={sendComment}>Send comment</button>

					</div>

					{/* Map all comments */}
					{postComments.map(comment => {

						{/* If showReplyOptions don't exists create it */ }
						{/* This works for showing reply textarea so user can write reply */ }
						if (comment.showReplyOptions === undefined && comment.index === undefined && comment.userMultimediaReply === undefined &&
							comment.base64Images === undefined && comment.base64Videos === undefined) {

							Object.assign(comment, { showReplyOptions: false, userMultimediaReply: [], indexOfComment: 0, indexOfReply: 0, base64Images: [], base64Videos: [] })

						}

						if (comment.profileImage === undefined) {

							axios.get(`${serverAddress}get-user-profile-image`, { params: { username: comment[4] } }).then(res => {

								Object.assign(comment, { profileImage: res.data })

								forceUpdate()

							})

						}

						const displayImagesAndVideosReply = (imageOrVideo) => {

							// Do a for loop for each image or video in the array of images
							for (let index = 0; index < imageOrVideo.target.files.length; index++) {

								// Create a new file reader
								let reader = new FileReader()

								// If the file is a image do this
								if (imageOrVideo.target.files[index].type.includes("image")) {

									// Put the image url in userMultimediaReply so user can see it
									comment.userMultimediaReply.push(["image", URL.createObjectURL(imageOrVideo.target.files[index])])

									// Read image as dataUrl
									reader.readAsDataURL(imageOrVideo.target.files[index])

									reader.onload = function () {

										// Put the base64 image into base64Images so it can be send it to backend
										comment.base64Images.push(["image", reader.result])

									}

								}

								// If file is video do this
								else if (imageOrVideo.target.files[index].type.includes("video")) {

									// Put the video in userMultimediaReply so user can see it
									comment.userMultimediaReply.push(["video", URL.createObjectURL(imageOrVideo.target.files[index])])

									// Read video as data url
									reader.readAsDataURL(imageOrVideo.target.files[index])

									reader.onload = function () {

										// Put video in base64Videos so it can be send to backend
										comment.base64Videos.push(["video", reader.result])

									}

								}

							}

							forceUpdate()

						}

						const incrementIndexComment = (type) => {

							if (type === "comment") {

								/* If index is less than the multimedia length change index */
								if (comment.indexOfComment + 1 < JSON.parse(comment[3]).length) {

									Object.assign(comment, { indexOfComment: comment.indexOfComment + 1 })

									forceUpdate()

								}

							} else if (type === "reply") {

								/* If index is less than the multimedia length change index */
								if (comment.indexOfReply + 1 < comment.userMultimediaReply.length) {

									Object.assign(comment, { indexOfReply: comment.indexOfReply + 1 })

									forceUpdate()

								}

							}

						}

						const decreaseIndexComment = (type) => {

							if (type === "comment") {

								/* If the index is greater than 0 change index */
								if (comment.indexOfComment - 1 > -1) {

									Object.assign(comment, { indexOfComment: comment.indexOfComment - 1 })

									forceUpdate()

								}

							} else if (type === "reply") {

								/* If the index is greater than 0 change index */
								if (comment.indexOfReply - 1 > -1) {

									Object.assign(comment, { indexOfReply: comment.indexOfReply - 1 })

									forceUpdate()

								}

							}

						}

						const deleteFileReply = (file, type) => {

							/* Delete file with filter */
							comment.userMultimediaReply = comment.userMultimediaReply.filter(fileToFilter => fileToFilter !== file)

							/* If is type image delete from userImagesBase64 */
							if (type === "image") {

								comment.base64Images = comment.base64Images.splice(userMultimediaIndex, 1)

							}

							/* If is type video delete from userVideosBase64 */
							else if (type === "video") {

								comment.base64Videos = comment.base64Videos.splice(userMultimediaIndex, 1)

							}

							/* If user index minus one is greater than 0 rest 1 to the index */
							if (comment.indexOfReply - 1 > 0) {

								comment.indexOfReply = comment.indexOfReply - 1

								/* If index is equal to 0 or less than 0 put index as 0 */
							} else if (comment.indexOfReply - 1 === 0 || comment.indexOfReply - 1 < 0) {

								comment.indexOfReply = 0

							}

							forceUpdate()

						}

						return (

							<div id="comment-div-see-post-page" key={comment[0]}>

								<h3>From {comment[4]}</h3>

								<img id="profile-image-see-post-page" width="100" src={pathToImagesAndVideos + comment.profileImage}></img>

								<h2>{comment[2]}</h2>

								<h3>{comment[5]}</h3>

								{JSON.parse(comment[3]).length > 0 &&

									<div id="next-previous-image-div-comment-body">

										{/* Displaying images and videos */}
										{JSON.parse(comment[3])[comment.indexOfComment][0] === "video" && <video width="500" src={pathToImagesAndVideos + JSON.parse(comment[3])[comment.indexOfComment][1]} controls></video>}

										{JSON.parse(comment[3])[comment.indexOfComment][0] === "image" && <img id="img-comment-body-section" width="500" src={pathToImagesAndVideos + JSON.parse(comment[3])[comment.indexOfComment][1]}></img>}

										{/* If user multimedia is greater than one show next and previous image or video option */}
										{JSON.parse(comment[3]).length > 1 &&

											<div id="next-previous-image-comment-body-section">

												{comment.indexOfComment !== 0 &&

													<MdNavigateNext id="previous-image-see-post-page" onClick={() => decreaseIndexComment("comment")}></MdNavigateNext>

												}

												{JSON.parse(comment[3]).length - 1 !== comment.indexOfComment &&

													<MdNavigateNext id="next-image-see-post-page" onClick={() => incrementIndexComment("comment")}></MdNavigateNext>

												}

											</div>

										}

									</div>

								}

								<div id="likes-comment-div-see-post-page">

									<BiUpvote id="upvote-comment-in-see-post-page" onClick={() => sendLike(comment[0], "comment")}></BiUpvote>

									<BiDownvote id="downvote-comment-in-see-post-page" onClick={() => sendDislike(comment[0], "comment")}></BiDownvote>

								</div>


								<br></br>

								{comment.showReplyOptions === false ?

									<button id="send-reply-button" onClick={() => {

										// If send reply is clicked show text area so user can write reply
										Object.assign(comment, { showReplyOptions: true })

										forceUpdate()

									}}>Show Reply options</button>

									:

									<button id="send-reply-button" onClick={() => {

										// If send reply is clicked show text area so user can write reply
										Object.assign(comment, { showReplyOptions: false })

										forceUpdate()

									}}>Hide Reply options</button>

								}

								<br></br>

								{comment.showReplyOptions === true &&

									<div id="send-reply-section-see-profile-page">

										{/* Reply options */}
										<textarea id="content-of-reply" placeholder="Your reply"></textarea>

										{comment.userMultimediaReply.length > 0 &&

											<>

												{/* Displaying images and videos */}
												{comment.userMultimediaReply[comment.indexOfReply][0] === "image" && <img id="image-see-post-page-reply" width="500" src={comment.userMultimediaReply[comment.indexOfReply][1]}></img>}

												{comment.userMultimediaReply[comment.indexOfReply][0] === "video" && <video width="500" controls src={comment.userMultimediaReply[comment.indexOfReply][1]}></video>}

												{comment.userMultimediaReply.length > 1 &&

													<div id="send-reply-next-previous-image-buttons">

														{comment.indexOfReply !== 0 &&

															<MdNavigateNext id="previous-image-see-post-page" onClick={() => decreaseIndexComment("reply")}></MdNavigateNext>

														}

														{comment.userMultimediaReply.length - 1 !== comment.indexOfReply &&

															<MdNavigateNext id="next-image-see-post-page" onClick={() => incrementIndexComment("reply")}></MdNavigateNext>

														}

													</div>

												}

												<button id="delete-file-see-post-page-reply-section" onClick={() => deleteFileReply(comment.userMultimediaReply[comment.indexOfReply], comment.userMultimediaReply[comment.indexOfReply][0])}>Delete file</button>

											</>

										}

										<label>

											<input id="hide-input-image-see-post-page" multiple onChange={(event) => displayImagesAndVideosReply(event)} type="file"></input>

											<FaImage id="image-upload-icon"></FaImage>

										</label>


										<button id="send-reply-button-see-post-page" onClick={() => {

											sendReply(comment[0], comment.base64Images, comment.base64Videos)

											// If send reply is clicked show text area so user can write reply
											Object.assign(comment, { showReplyOptions: false })

											forceUpdate()

										}}>Send reply</button>

									</div>

								}

								{/* Mapping replies */}
								{postReplies.map(reply => {

									if (reply.indexOfReplyMultimedia === undefined) {

										Object.assign(reply, { indexOfReplyMultimedia: 0 })

									}

									if (reply.profileImage === undefined) {

										axios.get(`${serverAddress}get-user-profile-image`, { params: { username: reply[5] } }).then(res => {

											Object.assign(reply, { profileImage: res.data })

											forceUpdate()

										})

									}

									// reply.indexOfReplyMultimedia

									const incrementIndexReply = () => {

										/* If index is less than the multimedia length change index */
										if (reply.indexOfReplyMultimedia + 1 < JSON.parse(reply[4]).length) {

											Object.assign(reply, { indexOfReplyMultimedia: reply.indexOfReplyMultimedia + 1 })

											forceUpdate()

										}


									}

									const decreaseIndexReply = () => {

										/* If the index is greater than 0 change index */
										if (reply.indexOfReplyMultimedia - 1 > -1) {

											Object.assign(reply, { indexOfReplyMultimedia: reply.indexOfReplyMultimedia - 1 })

											forceUpdate()

										}

									}

									{/* If reply parent comment id is equal to comment id show the reply where it belongs */ }
									if (reply[0] === comment[0]) {

										return (

											<div style={{ marginLeft: 20 }}>

												<h3>From {reply[5]}</h3>

												<img id="profile-image-see-post-page" width="100" src={pathToImagesAndVideos + reply.profileImage}></img>

												<h2>{reply[3]}</h2>

												<h3>{reply[6]}</h3>

												{JSON.parse(reply[4]).length > 0 &&

													<>

														{JSON.parse(reply[4])[reply.indexOfReplyMultimedia][0] === "image" && <img width="500" src={pathToImagesAndVideos + JSON.parse(reply[4])[reply.indexOfReplyMultimedia][1]}></img>}

														{JSON.parse(reply[4])[reply.indexOfReplyMultimedia][0] === "video" && <video width="500" controls src={pathToImagesAndVideos + JSON.parse(reply[4])[reply.indexOfReplyMultimedia][1]}></video>}

														{JSON.parse(reply[4]).length > 1 &&

															<div id="reply-body-next-previous-image-buttons">

																{reply.indexOfReplyMultimedia !== 0 &&

																	<MdNavigateNext id="previous-image-see-post-page" onClick={decreaseIndexReply}></MdNavigateNext>

																}

																{JSON.parse(reply[4]).length - 1 !== reply.indexOfReplyMultimedia &&

																	<MdNavigateNext id="next-image-see-post-page" onClick={incrementIndexReply}></MdNavigateNext>

																}

															</div>

														}

													</>

												}

												<br></br>


												<div id="likes-reply-div-see-post-page">

													<BiUpvote id="upvote-reply-in-see-post-page" onClick={() => sendLike(reply[2], "reply")}></BiUpvote>

													<BiDownvote id="downvote-reply-in-see-post-page" onClick={() => sendDislike(reply[2], "reply")}></BiDownvote>

												</div>

											</div>

										)

									}

								})}

							</div>

						)

					})}

				</div>

			</div >

		</div>
	)
}

export default SeePostpage
