import { useEffect, useState, useReducer } from "react"

import axios from "axios"

import "../css_of_components/CommunityPage.css"

import { BiUpvote, BiDownvote, BiCommentDetail } from "react-icons/bi"

import { FaRegBookmark } from "react-icons/fa6"

function CommunityPage() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// Path to images and videos so user can see it
	const pathToImagesAndVideos = "../../src/backend/"

	// Force update to the page when its neccesary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	// All the community information like title, rules, description
	const communityInfo = JSON.parse(sessionStorage.getItem("communityInfo"))

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// Password of logged user
	const password = credentialsParsed.password

	// This useSatte works to see if user is already subscribed and if it is subscribed can't subscribe more than one time
	const [userIsSubscribed, setUserIsSubscribed] = useState(false)

	// All posts of this community
	const [postsFromCommunity, setPostsFromCommunity] = useState([])

	// Variable so the program know if the user is moderator
	const [isUserModerator, setIsUserModerator] = useState(false)

	// Limit the times new publications are loaded
	const [addPublications, setAddPublications] = useState(false)

	const [userSorted, setUserSorted] = useState(false)

	const [typeOfSort, setTypeOfSort] = useState("normal")

	useEffect(() => {

		axios.get(`${serverAddress}check-subscription-to-community`, { params: { username: username, communityName: communityInfo[1] } }).then(res => {

			if (res.data === "alreadySubscribed") {

				setUserIsSubscribed(true)


			} else if (res.data === "notSubscribed") {

				setUserIsSubscribed(false)

			}


		})

		axios.get(`${serverAddress}send-to-user-publications-of-specific-community`, { params: { communityName: communityInfo[1] } }).then(res => {

			setPostsFromCommunity(res.data)

		})

		axios.post(`${serverAddress}check-if-user-is-banned-from-community`, { params: { username: username, communityName: communityInfo[1] } }).then(res => {

			if (res.data === "banned") {

				window.location.href = `${localAddress}banned-page`

				sessionStorage.setItem("nameOfWhereUserIsBanned", communityInfo[1])

			}

		})

		communityInfo[3].map(admins => {

			if (admins === username) {

				setIsUserModerator(true)

			}

		})

		communityInfo[4]?.map(moderators => {

			if (moderators === username) {

				setIsUserModerator(true)

			}

		})

	}, [])

	useEffect(() => {

		if (addPublications === true) {

			setTimeout(() => {

				setAddPublications(false)

			}, 3000)

		}

	}, [addPublications])

	window.onscroll = () => {

		if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight && addPublications === false) {

			let idOfPosts = []

			for (let index = 0; index < postsFromCommunity.length; index++) {

				idOfPosts.push(postsFromCommunity[index][0])

			}

			setAddPublications(true)

			axios.post(`${serverAddress}send-more-posts`, { params: { type: "communityPage", communityName: communityInfo[1], idOfPosts: idOfPosts, typeOfSort: typeOfSort } }).then(res => {

				for (let index = 0; index < res.data.length; index++) {

					setPostsFromCommunity(prevState => [...prevState, res.data[index]])

				}

			})

		}
	}

	return (

		<div>

			<div id="gradient-line-community-page"></div>

			<div id="second-main-div-community-page">

				<div id="community-info-div">

					<img id="logo-of-community-page" style={{ borderRadius: "70%" }} src={pathToImagesAndVideos + communityInfo[8]}></img>

					<h2>Welcome to {communityInfo[1]}</h2>

					{
						userIsSubscribed === true ?

							<div id="div-create-post-community">

								<h3>You are a member of {communityInfo[1]}</h3>

								<button id="create-post-community-page" onClick={() => {

									sessionStorage.setItem("communityNameToPost", communityInfo[1])

									window.location.href = `${localAddress}main-page/profile-page/post-page`

								}}>Create a post in this community</button>

							</div>

							:

							<button onClick={() => {

								axios.post(`${serverAddress}subscribe-to-community`, { params: { communityName: communityInfo[1], username: username } }).then(() => {

									setUserIsSubscribed(true)

								})

							}}>Subscribe to {communityInfo[1]}</button>

					}

					<h2>Description</h2>

					<h3>{communityInfo[2]}</h3>

					<h2>Rules</h2>

					<h4>{communityInfo[6]}</h4>

					<h4>Followers {communityInfo[5]}</h4>

					<select onChange={() => forceUpdate()} id="sort-publications-by">

						<option>Sort publications by...</option>

						<option>Newest</option>

						<option>Popular</option>

						<option>Newest and popular</option>

						<option>Oldest</option>

					</select>

					{document.getElementById("sort-publications-by")?.value !== "Sort publications by..." && <button onClick={() => {

						const typeOfSort = document.getElementById("sort-publications-by").value

						axios.get(`${serverAddress}sort-publications-by`, { params: { typeOfSort: typeOfSort, community: communityInfo[1] } }).then(res => {

							setPostsFromCommunity(res.data)

							setUserSorted(true)

							setTypeOfSort(typeOfSort)

						})

					}}>Sort</button>}

					{userSorted === true && <button onClick={() => {

						// Get posts and show them to main page of user
						axios.get(`${serverAddress}show-posts`, { params: { type: "mainPage" } }).then(res => {

							setPostsFromCommunity(res.data)

							setUserSorted(false)

						})

					}}>Show all posts again</button>}

				</div>

				<div id="posts-of-community">

					{postsFromCommunity.map(post => {

						{/* Redirect user to the post they want to see */ }
						const redirectUserToSeePost = () => {

							// Set in session storage the post info
							sessionStorage.setItem("postInfoToSee", JSON.stringify(post))

							// Redirect user to see post page where it can see post with comentaries and replies
							window.location.href = `${localAddress}main-page/see-post-page`

						}

						const giveLike = () => {

							axios.post(`${serverAddress}send-like-to-post`, { params: { idOfPost: post[0], communityName: post[5], username: username, password: password } }).then(res => {

								if (res.data == "likeAdded") {

									post[4] = post[4] + 1

								} else if (res.data == "likeRemoved") {

									post[4] = post[4] - 1

								} else if (res.data == "likeADisliked") {

									post[4] = post[4] + 2

								}

								forceUpdate()

							})


						}

						const giveDislike = () => {

							axios.post(`${serverAddress}send-dislike-to-post`, { params: { idOfPost: post[0], username: username, password: password } }).then(res => {

								if (res.data === "disliked") {

									post[4] = post[4] - 1

								} else if (res.data == "alreadyDisliked") {

									post[4] = post[4] + 1

								} else if (res.data == "dislikedALiked") {

									post[4] = post[4] - 2

								}

								forceUpdate()

							})

						}

						const savePost = () => {

							axios.post(`${serverAddress}save-post`, { params: { username: username, idOfPost: post[0] } })

						}

						const moderatorOptions = (type, id, username, password, email) => {

							axios.post(`${serverAddress}perform-moderator-actions-with-user`, { params: { type: type, id: id, username: username, password: password, email: email, communityName: communityInfo[1] } })

						}

						if (post.profileImage === undefined) {

							axios.get(`${serverAddress}get-user-profile-image`, { params: { username: post[6] } }).then(res => {

								Object.assign(post, { profileImage: res.data })

								forceUpdate()

							})

						}

						return (

							<div id="posts-div-community-page" key={post[0]}>

								{/* If user clicks the post the post will be seen in SeePostPage.jsx */}
								<div key={post[0] + " body"} onClick={redirectUserToSeePost}>

									<h2>{post[6]}</h2>

									{/* Showing title of post */}
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

								<h2>{post[4]}</h2>

								<div id="options-of-post-div-community-page">

									<BiUpvote id="like-community-page" onClick={giveLike}></BiUpvote>

									<BiDownvote id="dislike-community-page" onClick={giveDislike}></BiDownvote>

									<BiCommentDetail id="comment-community-page" onClick={redirectUserToSeePost}></BiCommentDetail>

									<FaRegBookmark id="save-community-page" onClick={savePost}></FaRegBookmark>

								</div>

								{isUserModerator === true &&

									<>

										<button id="show-moderator-options-community-page" onClick={() => {

											Object.assign(post, { showModeratorOptions: true })

											forceUpdate()

										}}>Show moderator options</button>

										{post.showModeratorOptions === true &&

											<div id="div-moderator-options-community-page">

												<br></br>

												<hr></hr>

												<input id="password-of-moderator" placeholder="Your password"></input>

												<input id="email-of-moderator" placeholder="Your email"></input>

												<button id="delete-post-button" onClick={() => moderatorOptions("deletePost", post[0], post[6], document.getElementById("password-of-moderator").value, document.getElementById("email-of-moderator").value)}>Delete this post</button>

												<button id="ban-user-button" onClick={() => moderatorOptions("banUser", post[0], post[6], document.getElementById("password-of-moderator").value, document.getElementById("email-of-moderator").value)}>Ban this user</button>

											</div>

										}

									</>

								}

							</div>

						)

					})}

				</div>

			</div >

		</div>

	)

}

export default CommunityPage
