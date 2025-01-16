import { useState, useEffect } from "react"

import axios from "axios"

import "../css_of_components/ProfilePage.css"

function OtherProfilePage() {

	// Path to images and videos so user can see it
	const pathToImagesAndVideos = "../src/backend/"

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	const searchedUserInfo = JSON.parse(sessionStorage.getItem("profileSearchedInfo"))

	// useState to know what user wants to see
	const [userWantsToSee, setUserWantsToSee] = useState("")

	// information user wants like posts, comments, replies, liked posts, disliked posts, saved posts
	const [informationUserWants, setInformationUserWants] = useState([])

	const [userProfileImage, setUserProfileImage] = useState()

	useEffect(() => {

		axios.get(`${serverAddress}get-user-profile-image`, { params: { username: searchedUserInfo[1] } }).then(res => {

			setUserProfileImage(res.data)

		})

	}, [])

	const chatWithThisUser = () => {

		sessionStorage.setItem("directChatInfo", JSON.stringify([username, searchedUserInfo[1]]))

		window.location.href = `${localAddress}main-page/browse-chats`

	}

	return (

		<div>

			<button onClick={() => {

				window.location.href = `${localAddress}main-page`

			}} id="go-back-button">Go Back</button>

			<div id="cool-effect-profile-page"></div>

			<div id="main-profile-page-div">

				<img id="profile-image-profile-page" src={pathToImagesAndVideos + userProfileImage}></img>

				<h2 id="presentation-of-profile">User {searchedUserInfo[1]} profile page</h2>

				<div id="main-options-div">

					<button id="profile-page-option-button" onClick={chatWithThisUser}>Create Chat with this user</button>

					<button id="profile-page-option-button" onClick={() => {

						sessionStorage.setItem("directChatInfo", "redirectFromProfilePage")

						window.location.href = `${localAddress}main-page/browse-chats`
					}

					}>Chats</button>

					{/* Button to display all posts user made */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show posts request to backend
						axios.get(`${serverAddress}show-posts`, { params: { type: "userProfilePage", author: searchedUserInfo[1] } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("posts")

					}}>Posts</button>

					{/* Button to display all cometaries user made */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show comments user made, request to backend
						axios.get(`${serverAddress}show-comments-profile`, { params: { username: searchedUserInfo[1] } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("comments")

					}}>Commentaries</button>

					{/* Button to display all replies user made */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show replies in posts request to backend
						axios.get(`${serverAddress}show-replies-profile`, { params: { username: searchedUserInfo[1] } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("replies")

					}}>Replies</button>

					{/* Button to display all liked posts of user */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show liked posts request to backend
						axios.get(`${serverAddress}see-liked-posts-profile`, { params: { username: searchedUserInfo[1] } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("likedPosts")

					}}>Liked</button>

					{/* Button to display all disliked posts of user */}
					<button id="profile-page-option-button" onClick={() => {

						// Clear useState informationUserWants so user can see only what he wants to see
						setInformationUserWants([])

						// Show disliked posts request to backend
						axios.get(`${serverAddress}see-disliked-posts-profile`, { params: { username: searchedUserInfo[1] } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("dislikedPosts")

					}}>Disliked</button>

					{/* Button to display communities user is in */}
					<button id="profile-page-option-button" onClick={() => {

						setInformationUserWants([])

						axios.get(`${serverAddress}send-community-user-is-following`, { params: { username: searchedUserInfo[1] } }).then(res => {

							setInformationUserWants(res.data)

						})

						setUserWantsToSee("communities")

					}}>Communities</button>

				</div>

				<br></br>

				<div id="created-posts-div">

					{userWantsToSee === "posts" &&

						informationUserWants.map(post => {

							{/* Redirect user to the post he wants to see */ }
							const redirectUserToSeePost = () => {

								// Set in session storage the post info
								sessionStorage.setItem("postInfoToSee", JSON.stringify(post))

								// Redirect user to see post page where he can see the post with commentaries replies etc...
								window.location.href = `${localAddress}main-page/see-post-page`

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

									</div>

								</>

							)

						})

					}


					{userWantsToSee === "comments" &&

						<>

							{informationUserWants.map(comments => {

								return (

									<div id="content-profile">

										<h1>From {comments[6]}</h1>

										<h2>{comments[2]}</h2>

										<button id="button-options-of-content" onClick={() => goToPostWithCommentOrReply(comments[1])}>Go to post of comment</button>

									</div>

								)

							})}

						</>

					}

					{userWantsToSee === "replies" &&

						informationUserWants.map(replies => {

							return (

								<div id="content-profile">

									<h2>From {replies[7]}</h2>

									<h3>{replies[3]}</h3>

									<button id="button-options-of-content" onClick={() => goToPostWithCommentOrReply(replies[1])}>Go to the post of this reply</button>

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

				</div>

			</div>

		</div>

	)

}

export default OtherProfilePage
