import { useEffect, useState, useReducer } from "react"

import axios from "axios"

import "../css_of_components/ProfilePage.css"

function ProfilePage() {

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// Path to images and videos so user can see it
	const pathToImagesAndVideos = "../src/backend/"

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// useState to know what user wants to see
	const [userWantsToSee, setUserWantsToSee] = useState("posts")

	// information user wants like posts, comments, replies, liked posts, disliked posts, saved posts
	const [informationUserWants, setInformationUserWants] = useState([])

	const [userProfileImage, setUserProfileImage] = useState()

	// Force update to the page when its necessary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	useEffect(() => {

		axios.get(`${serverAddress}get-user-profile-image`, { params: { username: username } }).then(res => {

			setUserProfileImage(res.data)

		})

		// Show posts request to backend
		axios.get(`${serverAddress}show-posts`, { params: { type: "userProfilePage", username: username } }).then(res => {

			setInformationUserWants(res.data)

		})

	}, [])

	const goToPostWithCommentOrReply = (idOfPost) => {

		axios.get(`${serverAddress}send-post-information-with-a-reply`, { params: { idOfPost: idOfPost } }).then(res => {

			// Set in session storage the post info
			sessionStorage.setItem("postInfoToSee", JSON.stringify(res.data[0]))

			// Redirect user to see post page where it can see post with commentaries and replies
			window.location.href = `${localAddress}main-page/see-post-page`

		})

	}

	return (

		<div>

			<button onClick={() => {
				
				window.location.href = `${localAddress}main-page`

			}} id="go-back-button">Go Back</button>

			<div id="cool-effect-profile-page"></div>

			<div id="main-profile-page-div">

				<img id="profile-image-profile-page" width="200" src={pathToImagesAndVideos + userProfileImage}></img>

				<h1 id="presentation-of-profile">{username} Page (Your page)</h1>

				<div id="main-options-div">

					<button id="profile-page-option-button" onClick={() => {

						sessionStorage.setItem("directChatInfo", "redirectFromProfilePage")

						window.location.href = `${localAddress}main-page/browse-chats`
					}

					}>Chats</button>

					<button id="profile-page-option-button" onClick={() => {

						window.location.href = `${localAddress}main-page/profile-settings`

					}}>Profile settings</button>

					{/* Button to display all posts user made */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show posts request to backend
						axios.get(`${serverAddress}show-posts`, { params: { type: "userProfilePage", username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("posts")

					}}>Posts</button>

					{/* Button to display all commentaries user made */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show comments user made, request to backend
						axios.get(`${serverAddress}show-comments-profile`, { params: { username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("comments")

					}}>Commentaries</button>

					{/* Button to display all replies user made */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show replies in posts request to backend
						axios.get(`${serverAddress}show-replies-profile`, { params: { username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("replies")

					}}>Replies</button>

					{/* Button to display all liked posts of user */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show liked posts request to backend
						axios.get(`${serverAddress}see-liked-posts-profile`, { params: { username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("likedPosts")

					}}>Liked</button>

					{/* Button to display all disliked posts of user */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show disliked posts request to backend
						axios.get(`${serverAddress}see-disliked-posts-profile`, { params: { username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("dislikedPosts")

					}}>Disliked</button>

					{/* Button to display saved publications */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show saved posts request to backend
						axios.get(`${serverAddress}show-saved-posts`, { params: { username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("savedPosts")

					}}>Saved</button>

					{/* Button to display communities user is in */}
					<button id="profile-page-option-button" onClick={() => {

						setInformationUserWants([])

						axios.get(`${serverAddress}send-community-user-is-following`, { params: { username: username } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("communities")

					}}>Communities</button>

					<br></br>

					{/* Redirect the user to PostPage and show him the options to create his publication */}
					<button id="profile-page-option-button" onClick={() => {

						sessionStorage.setItem("communityNameToPost", "noSpecificCommunityChoosed")

						window.location.href = `${localAddress}main-page/profile-page/post-page`

					}}>Create Post</button>

					{/* Create a community redirection button */}
					<button id="profile-page-option-button" onClick={() => window.location.href = `${localAddress}main-page/profile-page/community-creation-page`}>Create community</button>

					<br></br>

				</div>

				<div id="created-posts-div">

					{userWantsToSee === "comments" &&

						<>

							{informationUserWants.map(comments => {

								if (comments.indexOfMultimedia === undefined) {

									Object.assign(comments, { indexOfMultimedia: 0 })

								}

								const deleteComment = () => {

									axios.post(`${serverAddress}delete-comment`, { params: { id: comments[0] } })

									setTimeout(() => {

										// Clear useState informationUserWants so user can see only what he wants to see
										setInformationUserWants([])

										// Show comments user made, request to backend
										axios.get(`${serverAddress}show-comments-profile`, { params: { username: username } }).then(res => {

											setInformationUserWants(res.data)

										})

										setUserWantsToSee("comments")

									}, 2000)

								}

								const commentImageParsed = JSON.parse(comments[3])

								/* Go to next image or video */
								const goToNextMultimedia = () => {

									/* If index is less than the list of images show the next file  */
									if (comments.indexOfMultimedia + 1 < commentImageParsed.length) {

										Object.assign(comments, { indexOfMultimedia: comments.indexOfMultimedia + 1 })

										forceUpdate()

									}

								}

								/* Go to previous image or video */
								const goToPreviousMultimedia = () => {

									/* If index is greater than minus one show the previous file */
									if (comments.indexOfMultimedia - 1 > -1) {

										Object.assign(comments, { indexOfMultimedia: comments.indexOfMultimedia - 1 })

										forceUpdate()

									}

								}

								return (

									<div id="content-profile">

										<h1>From {comments[6]}</h1>

										<h2>{comments[2]}</h2>

										{commentImageParsed.length > 0 &&

											<>

												{commentImageParsed[comments.indexOfMultimedia][0] === "image" && <img id="image-profile-page" src={pathToImagesAndVideos + commentImageParsed[comments.indexOfMultimedia][1]}></img>}

												{commentImageParsed[comments.indexOfMultimedia][0] === "video" && <video controls width="300" src={pathToImagesAndVideos + commentImageParsed[comments.indexOfMultimedia][1]}></video>}

												{commentImageParsed.length > 1 &&

													<>

														<button id="button-options-of-content" onClick={goToNextMultimedia}>Next</button>

														<button id="button-options-of-content" onClick={goToPreviousMultimedia}>Previous</button>

													</>

												}

											</>

										}

										<button id="button-options-of-content" onClick={() => goToPostWithCommentOrReply(comments[1])}>Go to post of comment</button>

										<button id="button-options-of-content" onClick={deleteComment}>Delete this comment</button>

									</div>

								)

							})}

						</>

					}

					{userWantsToSee === "replies" &&

						informationUserWants.map(replies => {

							if (replies.indexOfMultimedia === undefined) {

								Object.assign(replies, { indexOfMultimedia: 0 })

							}

							const deleteReply = () => {

								axios.post(`${serverAddress}delete-reply`, { params: { id: replies[2] } })

							}

							const repliesImagesParsed = JSON.parse(replies[4])

							/* Go to next image or video */
							const goToNextMultimedia = () => {

								/* If index is less than the list of images show the next file  */
								if (replies.indexOfMultimedia + 1 < repliesImagesParsed.length) {

									Object.assign(replies, { indexOfMultimedia: replies.indexOfMultimedia + 1 })

									forceUpdate()

								}

							}

							/* Go to previous image or video */
							const goToPreviousMultimedia = () => {

								/* If index is greater than minus one show the previous file */
								if (replies.indexOfMultimedia - 1 > -1) {

									Object.assign(replies, { indexOfMultimedia: replies.indexOfMultimedia - 1 })

									forceUpdate()

								}

							}



							return (

								<div id="content-profile">

									<h2>From {replies[7]}</h2>

									<h3>{replies[3]}</h3>

									{repliesImagesParsed.length > 0 &&

										<>

											{repliesImagesParsed[replies.indexOfMultimedia][0] === "image" && <img id="image-profile-page" src={pathToImagesAndVideos + repliesImagesParsed[replies.indexOfMultimedia][1]}></img>}

											{repliesImagesParsed[replies.indexOfMultimedia][0] === "video" && <video controls width="300" src={pathToImagesAndVideos + repliesImagesParsed[replies.indexOfMultimedia][1]}></video>}

											{repliesImagesParsed.length > 1 &&

												<>

													<button id="button-options-of-content" onClick={goToNextMultimedia}>Next</button>

													<button id="button-options-of-content" onClick={goToPreviousMultimedia}>Previous</button>

												</>

											}

										</>

									}

									<button id="button-options-of-content" onClick={() => goToPostWithCommentOrReply(replies[1])}>Go to the post of this reply</button>

									<button id="button-options-of-content" onClick={deleteReply}>Delete this reply</button>

								</div>

							)

						})

					}

					{userWantsToSee == "likedPosts" &&

						informationUserWants.map(likedPost => {

							return (

								<div id="content-profile">

									<h3>You give a like to the post: {likedPost[0]}</h3>

									<button id="button-options-of-content" onClick={() => goToPostWithCommentOrReply(likedPost[1])}>Go to this post</button>

								</div>

							)

						})

					}

					{userWantsToSee === "dislikedPosts" &&

						informationUserWants.map(dislikedPosts => {

							return (

								<div id="content-profile">

									<h2>You disliked post: {dislikedPosts[0]}</h2>

									<button id="button-options-of-content" onClick={() => goToPostWithCommentOrReply(dislikedPosts[1])}>Go to this post</button>

								</div>

							)

						})

					}

					{userWantsToSee === "savedPosts" &&

						informationUserWants.map(savedPosts => {

							const redirectUserToSeePost = () => {

								// Set in session storage the post info
								sessionStorage.setItem("postInfoToSee", JSON.stringify(savedPosts))

								// Redirect user to see post page where it can see post with commentaries and replies
								window.location.href = `${localAddress}main-page/see-post-page`

							}

							return (

								<div id="content-profile">

									{/* If user clicks the post the post will be seen in SeePostPage.jsx */}
									<div onClick={redirectUserToSeePost}>

										<hr></hr>

										{/* Showing community post is from */}
										<h3>{savedPosts[7]}</h3>

										{/* Showing title of post */}
										<h2>{savedPosts[1]}</h2>

										{savedPosts[3] !== "noImageAndVideo" &&

											<>

												{/* If file is type image display as image */}
												{/* NOTE:  JSON.parse(post[3])[0][0] is the first file format type value in this case is image */}
												{JSON.parse(savedPosts[3])[0][0] === "image" && <img width="500" src={pathToImagesAndVideos + JSON.parse(savedPosts[3])[0][1]}></img>}

												{/* If file is type video display as video */}
												{/* NOTE:  JSON.parse(post[3])[0][0] is the first file format type value in this case is video */}
												{JSON.parse(savedPosts[3])[0][0] === "video" && <video width="300" preload="none" src={pathToImagesAndVideos + JSON.parse(savedPosts[3])[0][1]} controls></video>}

											</>

										}



									</div>

									<h2>{savedPosts[4]}</h2>

									{savedPosts.alreadyLiked === true && <h2>Already liked!</h2>}

									<br></br>

									<button id="button-options-of-content" onClick={redirectUserToSeePost}>Comment</button>

								</div>

							)

						})

					}

					{userWantsToSee === "communities" &&

						informationUserWants.map(community => {

							return (

								<div id="content-profile">

									<h3>{community}</h3>

									<button id="button-options-of-content" onClick={() => {

										axios.get(`${serverAddress}get-community-info`, { params: { "communityName[]": community } }).then(res => {

											sessionStorage.setItem("communityInfo", JSON.stringify(res.data))

											window.location.href = `${localAddress}main-page/profile-page/community-page`

										})

									}}>Go to this community</button>

								</div>

							)

						})

					}


					{userWantsToSee === "posts" &&

						informationUserWants.map(post => {

							{/* Redirect user to the post he wants to see */ }
							const redirectUserToSeePost = () => {

								// Set in session storage the post info
								sessionStorage.setItem("postInfoToSee", JSON.stringify(post))

								// Redirect user to see post page where he can see the post with commentaries replies etc...
								window.location.href = `${localAddress}main-page/see-post-page`

							}

							const deletePost = () => {

								axios.post(`${serverAddress}delete-post`, { params: { id: post[0] } })

								setTimeout(() => {

									// Clear useState informationUserWants so user can see only what he wants to see
									setInformationUserWants([])

									// Show saved posts request to backend
									axios.get(`${serverAddress}show-saved-posts`, { params: { username: username } }).then(res => {

										setInformationUserWants(res.data)

									})

									setUserWantsToSee("savedPosts")

								}, 2000)

							}

							return (

								<>

									<div id="content-profile" onClick={redirectUserToSeePost}>

										<h3>{post[7]}</h3>

										<h2>{post[1]}</h2>

										{post[3] !== "noImageAndVideo" &&

											<>

												{/* If file is type image display as image */}
												{/* NOTE:  JSON.parse(post[3])[0][0] is the first file format type value in this case is image */}
												{JSON.parse(post[3])[0][0] === "image" && <img width="500" src={pathToImagesAndVideos + JSON.parse(post[3])[0][1]}></img>}

												{/* If file is type video display as video */}
												{/* NOTE:  JSON.parse(post[3])[0][0] is the first file format type value in this case is video */}
												{JSON.parse(post[3])[0][0] === "video" && <video width="300" preload="none" src={pathToImagesAndVideos + JSON.parse(post[3])[0][1]} controls></video>}

											</>

										}



										<button id="button-options-of-content" onClick={deletePost}>Delete post</button>

									</div>

								</>

							)

						})

					}

				</div>

			</div>


		</div>

	)

}

export default ProfilePage
