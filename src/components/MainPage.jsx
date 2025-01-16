import { useEffect, useState, useReducer } from "react"

import axios from "axios"

import "../css_of_components/MainPage.css"

import { BiUpvote, BiDownvote, BiCommentDetail } from "react-icons/bi"

import { FaRegBookmark } from "react-icons/fa6"

import { IoSearchSharp } from "react-icons/io5"

import { AiOutlineBars } from "react-icons/ai";

import { AiOutlineClose } from "react-icons/ai";

function MainPage() {

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

	// User searched for info if true display all searched results
	const [userSearchedInfo, setUserSearchedInfo] = useState(false)

	// This useState specifies what thing user searched for
	const [userSearchedFor, setUserSearchedFor] = useState("")

	const [userSorted, setUserSorted] = useState(false)

	const [warnUser, setWarnUser] = useState("")

	// User searched values to be displayed
	const [userSearchedValues, setUserSearchedValues] = useState([])

	// Posts that are recommended to user
	const [publications, setPublications] = useState([])

	// Limit the times new publications are loaded
	const [addPublications, setAddPublications] = useState(false)

	const [typeOfSort, setTypeOfSort] = useState("normal")

	const [communityUserIsSubscribed, setCommunityUserIsSubscribed] = useState([])

	const [communitiesIconFilePath, setCommunitiesIconFilePath] = useState([])

	const [userActivatedBookmark, setUserActivatedBookmark] = useState(false)

	// Force update to the page when its necessary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	useEffect(() => {

		// Get posts and show them to main page of user
		axios.get(`${serverAddress}show-posts`, { params: { type: "mainPage", username: username } }).then(res => {

			setPublications(res.data)

		})

		axios.get(`${serverAddress}show-community-user-is-subscribed`, { params: { username: username } }).then(res => {

			setCommunityUserIsSubscribed(res.data)

		})

	}, [])

	useEffect(() => {

		if (communityUserIsSubscribed !== "noFollowedCommunitiesYet") {

			communityUserIsSubscribed.map(community => {

				axios.get(`${serverAddress}show-icon-of-community-to-user`, { params: { communityName: community } }).then(res => {

					setCommunitiesIconFilePath(prevState => [...prevState, res.data])

				})

			})

		}

	}, [communityUserIsSubscribed])

	useEffect(() => {

		if (addPublications === true) {

			setTimeout(() => {

				setAddPublications(false)

			}, 3000)

		}

	}, [addPublications])

	const doUserSearchInputIsEmpty = () => {

		let blankSpacesCount = 0;

		for (let index = 0; index < document.getElementById("search-input").value.length; index++) {

			if (document.getElementById("search-input").value[index] === "" || document.getElementById("search-input").value[index] === " ") {

				blankSpacesCount++

			}

		}

		if (blankSpacesCount === document.getElementById("search-input").value.length) {

			setWarnUser("userSearchedEmptySpacesOnly")

			setTimeout(() => {

				setWarnUser("")

			}, 3000)

			return "userSearchedEmptySpacesOnly"

		}

	}

	window.onscroll = () => {

		if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight && addPublications === false) {

			let idOfPosts = []

			for (let index = 0; index < publications.length; index++) {

				idOfPosts.push(publications[index][0])

			}

			setAddPublications(true)

			axios.post(`${serverAddress}send-more-posts`, { params: { type: "mainPage", username: username, typeOfSort: typeOfSort, idOfPosts: idOfPosts } }).then(res => {

				for (let index = 0; index < res.data.length; index++) {

					setPublications(prevState => [...prevState, res.data[index]])

				}

			})

		}
	}

	return (

		<div>

			<div id="gradient-line"></div>

			<div id="search-bar-div">

				<div id="search-input-and-icon-div">

					{/* Search input so user can search profiles and posts etc... */}
					<input id="search-input" placeholder="search here..."></input>

					{/* Search button */}
					<IoSearchSharp id="search-button" onClick={() => {

						if (doUserSearchInputIsEmpty() === "userSearchedEmptySpacesOnly") {

							return

						}

						// Getting the search information
						axios.get(`${serverAddress}search`, { params: { searchedInfo: document.getElementById("search-input").value } }).then(res => {

							// Assigning all searched values to userSearchedValues and then display it
							setUserSearchedValues(res.data)

						})

						// Converting userSearchedInfo to true so options show
						setUserSearchedInfo(true)

						// The default type of search is the publication one
						setUserSearchedFor("profiles")

					}}></IoSearchSharp>

					{warnUser === "userSearchedEmptySpacesOnly" && <div id="user-searched-empty"><h2>You searched a empty value in your search bar</h2></div>}

					{window.screen.width < 1170 && userSearchedFor === "" &&

						<div id="div-outline-bars">

							{userActivatedBookmark ?

								<AiOutlineClose onClick={() => setUserActivatedBookmark(false)} id="outline-bars-icon"></AiOutlineClose>

								:

								<AiOutlineBars onClick={() => setUserActivatedBookmark(true)} id="outline-bars-icon"></AiOutlineBars>

							}


							{userActivatedBookmark &&

								<div id="outline-bars-child-div">

									{/* Go to user profile page button */}
									<button id="go-to-profile-button-outline-div" onClick={() => {

										// Redirect user to profile page
										window.location.href = `${localAddress}main-page/profile-page`

									}}>Go to your profile</button>

									<select onChange={() => forceUpdate()} id="sort-publications-by">

										<option>Sort publications by...</option>

										<option>Newest</option>

										<option>Popular</option>

										<option>Newest and popular</option>

										<option>Oldest</option>

									</select>

									{
										document.getElementById("sort-publications-by")?.value !== "Sort publications by..." && <button id="sort-outline-div" onClick={() => {

											const typeOfSort = document.getElementById("sort-publications-by").value

											axios.get(`${serverAddress}sort-publications-by`, { params: { typeOfSort: typeOfSort, community: "noCommunity" } }).then(res => {

												setPublications(res.data)

												setUserSorted(true)

												setTypeOfSort(typeOfSort)

											})

										}}>Sort</button>
									}

								</div>

							}

						</div>

					}

				</div>

				{userSearchedInfo === true &&

					<div id="options-of-search-buttons">

						<div>

							<button id="show-publications-button" onClick={() => {

								axios.get(`${serverAddress}search-posts`, { params: { searchQuery: document.getElementById("search-input").value } }).then((res) => {

									setPublications(res.data)

									setUserSearchedFor("publications")

								})

							}}>Publications</button>

							<button id="show-profiles-button" onClick={() => {

								if (doUserSearchInputIsEmpty() === "userSearchedEmptySpacesOnly") {

									return

								}

								// Getting the search information
								axios.get(`${serverAddress}search`, { params: { searchedInfo: document.getElementById("search-input").value } }).then(res => {

									// Assigning all searched values to userSearchedValues and then display it
									setUserSearchedValues(res.data)

								})

								// Converting userSearchedInfo to true so options show
								setUserSearchedInfo(true)

								// The default type of search is the publication one
								setUserSearchedFor("profiles")

							}}>Profiles</button>

							<button id="show-communities-button" onClick={() => {

								if (doUserSearchInputIsEmpty() === "userSearchedEmptySpacesOnly") {

									return

								}

								setUserSearchedValues([])

								axios.get(`${serverAddress}show-communties-to-users`, { params: { searchedInfo: document.getElementById("search-input").value } }).then(res => {

									setUserSearchedValues(res.data)

								})

								setUserSearchedFor("communities")

							}}>Communities</button>

							<button id="hide-search-options" onClick={() => {
								setUserSearchedInfo(false)

								setUserSearchedFor("")
							}}>Hide Search Options</button>

						</div>

						{userSearchedFor !== "publications" &&

							<div id="profiles-community-searched-for">

								{/* Showing all necessary values */}
								{
									userSearchedFor === "profiles" &&

									userSearchedValues.map(profilesSearched => {

										const showUserProfileSearched = () => {

											sessionStorage.setItem("profileSearchedInfo", JSON.stringify(profilesSearched))

											window.location.href = `${localAddress}main-page/other-profile-page`

										}

										const userSearchedHisSameProfile = () => {

											window.location.href = `${localAddress}main-page/profile-page`

										}

										return (

											<div>

												{/* Displaying names of each user coincident with the search parameters of user */}

												{/* If user clicked his same profile redirect to his profile page */}
												{profilesSearched[1] === username && <h2 onClick={userSearchedHisSameProfile}>{profilesSearched[1]}</h2>}

												{/* Meanwhile the username is not the same to the actual user redirect to the other user page */}
												{profilesSearched[1] !== username && <h2 onClick={showUserProfileSearched}>{profilesSearched[1]}</h2>}

											</div>

										)

									})}

								{userSearchedFor === "communities" &&

									userSearchedValues.map(community => {

										return (

											<div id="profiles-community-searched-for">

												<h2 onClick={() => {

													axios.get(`${serverAddress}get-community-info`, { params: { communityName: community } }).then(res => {

														sessionStorage.setItem("communityInfo", JSON.stringify(res.data))

														window.location.href = `${localAddress}main-page/profile-page/community-page`

													})

												}}>{community}</h2>

											</div>

										)

									})

								}

							</div>
						}


						{userSearchedFor === "publications" &&

							<button id="show-original-posts-button" onClick={() => {

								// Get posts and show them to main page of user
								axios.get(`${serverAddress}show-posts`, { params: { type: "mainPage", username: username } }).then(res => {

									setPublications(res.data)

								})

								setUserSearchedFor("")

								setUserSearchedInfo(false)

							}}>Show original posts</button>

						}

					</div>

				}
			</div>


			{window.screen.width > 1170 &&

				<div id="followed-communities-column">

					<h1 id="title-of-page">BlazorNetwork</h1>

					{/* Go to user profile page button */}
					<button id="go-to-profile-button" onClick={() => {

						// Redirect user to profile page
						window.location.href = `${localAddress}main-page/profile-page`

					}}>Go to your profile</button>


					<select onChange={() => forceUpdate()} id="sort-publications-by">

						<option>Sort publications by...</option>

						<option>Newest</option>

						<option>Popular</option>

						<option>Newest and popular</option>

						<option>Oldest</option>

					</select>

					{communityUserIsSubscribed.length > 0 && communityUserIsSubscribed !== "noFollowedCommunitiesYet" && <h2 id="subscribed-communities-title">Subscribed Communities</h2>}

					{communityUserIsSubscribed !== "noFollowedCommunitiesYet" && communityUserIsSubscribed.map((community, index) => {

						return (

							<div id="subscribed-communities" onClick={() => {

								axios.get(`${serverAddress}get-community-info`, { params: { "communityName[]": community } }).then(res => {

									sessionStorage.setItem("communityInfo", JSON.stringify(res.data))

									window.location.href = `${localAddress}main-page/profile-page/community-page`

								})

							}}>

								<img id="community-icon-image" src={pathToImagesAndVideos + communitiesIconFilePath[index]}></img>

								<h3 onClick={() => {

									axios.get(`${serverAddress}get-community-info`, { params: { "communityName[]": community } }).then(res => {

										sessionStorage.setItem("communityInfo", JSON.stringify(res.data))

										window.location.href = `${localAddress}main-page/profile-page/community-page`

									})

								}}>{community}</h3>

								{
									document.getElementById("sort-publications-by")?.value !== "Sort publications by..." && <button onClick={() => {

										const typeOfSort = document.getElementById("sort-publications-by").value

										axios.get(`${serverAddress}sort-publications-by`, { params: { typeOfSort: typeOfSort, community: "noCommunity" } }).then(res => {

											setPublications(res.data)

											setUserSorted(true)

											setTypeOfSort(typeOfSort)

										})

									}}>Sort</button>
								}

							</div>

						)

					})}

				</div>

			}


			{
				userSorted === true && <button onClick={() => {

					// Get posts and show them to main page of user
					axios.get(`${serverAddress}show-posts`, { params: { type: "mainPage" } }).then(res => {

						setPublications(res.data)

						setUserSorted(false)

					})

				}}>Show all posts again</button>
			}

			{
				publications.map((post, index) => {

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

					if (post.profileImage === undefined) {

						axios.get(`${serverAddress}get-user-profile-image`, { params: { username: post[6] } }).then(res => {

							Object.assign(post, { profileImage: res.data })

							forceUpdate()

						})

					}

					return (

						<div id={index === 3 ? "posts-div-with-cool-effect" : index === 0 ? "first-post-div" : "posts-div"} key={post[0]}>

							{/* If user clicks the post the post will be seen in SeePostPage.jsx */}
							<div id="posts-div-body" key={post[0] + " body"} onClick={redirectUserToSeePost}>

								<div>

									<h3>{post[5]}</h3>

									<h2>{post[6]}</h2>

									{/* Showing community post is from */}

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

							</div>

							<div id="info-of-post-div">


								<div id="options-of-post-div">

									<div id="likes-div">

										<BiUpvote id="like-button" title="Like" onClick={giveLike}></BiUpvote>

										<h2>{post[4]}</h2>

										<BiDownvote id="dislike-button" title="Dislike" onClick={giveDislike}></BiDownvote>

									</div>

									<BiCommentDetail id="comment-icon" title="Comment in this post" onClick={redirectUserToSeePost}></BiCommentDetail>

									<FaRegBookmark id="save-post-icon" title="Save post" onClick={savePost}></FaRegBookmark>

								</div>

							</div>

						</div>


					)

				})
			}

		</div >

	)

}

export default MainPage
