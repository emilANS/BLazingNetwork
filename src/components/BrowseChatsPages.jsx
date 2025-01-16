import { useState, useEffect, useReducer } from "react"

import axios from "axios"

import "../css_of_components/BrowseChatPage.css"

import { IoSearchSharp } from "react-icons/io5"

function BrowseChatsPage() {

	// Address of local and server pages
	const serverAddress = "http://127.0.0.1:5000/"
	const localAddress = "http://localhost:5173/"

	// Credentials of user parsed because are stringified
	const credentialsParsed = JSON.parse(sessionStorage.getItem("userCredentials"))

	// Username of logged user
	const username = credentialsParsed.username

	// Password of logged user
	const password = credentialsParsed.password

	const [userWantsToCreateChat, setUserWantsToCreateChat] = useState(false)

	const [usersOfNewChat, setUsersOfNewChat] = useState([[username, "admin"]])

	const [chats, setChats] = useState([])

	const [searchedChats, setSearchedChats] = useState([])

	const [warnUser, setWarnUser] = useState("")

	const userWantsToCreateDirectChat = sessionStorage.getItem("directChatInfo")

	// Force update to the page when its neccesary
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	useEffect(() => {

		axios.get(`${serverAddress}show-chats-to-user`, { params: { username: username, password: password } }).then(res => {

			setChats(res.data)

		})

		if (userWantsToCreateDirectChat !== undefined && userWantsToCreateDirectChat !== "redirectFromProfilePage") {

			setUsersOfNewChat(JSON.parse(userWantsToCreateDirectChat))

			setUserWantsToCreateChat(true)

		}

	}, [])

	const addUserToNewChat = () => {

		const usernameOfInput = document.getElementById("name-of-user-in-chat").value

		for (let index = 0; index < usersOfNewChat.length; index++) {

			if (usernameOfInput === usersOfNewChat[index]) {

				setWarnUser("userAlreadyInList")

				setTimeout(() => {

					setWarnUser("")

				}, 2000)

				return

			}

		}

		axios.get(`${serverAddress}check-if-user-exists`, { params: { username: usernameOfInput } }).then(res => {

			if (res.data === "False") {

				setWarnUser("noUserWithThisUsername")

				setTimeout(() => {

					setWarnUser("")

				}, 2000)

				return

			} else if (res.data === "True" && usernameOfInput !== username) {

				setUsersOfNewChat(prevState => [...prevState, [usernameOfInput, "noAdmin"]])

			}

		})

	}

	const createChat = () => {

		const nameOfChat = document.getElementById("name-of-chat").value

		if (usersOfNewChat.length !== 1 && nameOfChat.length !== 0) {

			axios.post(`${serverAddress}create-chat`, { params: { usernames: usersOfNewChat, nameOfChat: nameOfChat } })

		}

	}

	const searchForChats = () => {

		const searchInfo = document.getElementById("search-chat-input").value

		const filteredChats = chats.filter(filterElement => filterElement[0].toLowerCase().includes(searchInfo.toLowerCase()))

		if (filteredChats.length > 0) {

			setSearchedChats(filteredChats)

		} else {

			setSearchedChats("noChatsFound")

		}

	}

	return (

		<div id="main-div-browse-chat-page">

			<div id="cool-effect-browse-chat-page"></div>

			<div id="main-browse-chat-div">

				<h1>Browse Your Chats</h1>

				<button id="create-chat-button" onClick={() => setUserWantsToCreateChat(true)}>Create new chat</button>

				<div id="secondary-browse-chat-div">

					<input id="search-chat-input" placeholder="search for chats"></input>

					<IoSearchSharp id="search-chats-button" onClick={searchForChats}></IoSearchSharp>

				</div>


				{searchedChats.length > 0 &&

					<button id="show-all-chats-again-button" onClick={() => {

						axios.get(`${serverAddress}show-chats-to-user`, { params: { username: username, password: password } }).then(res => {

							setChats(res.data)

							setSearchedChats([])

						})

					}}>Show all chats again</button>

				}


			</div>



			<div id="display-all-chats-div">

				{userWantsToCreateChat === true &&

					<div id="create-chat-info">

						<input id="name-of-chat" placeholder="name of chat"></input>

						<input id="name-of-user-in-chat" placeholder="name of user"></input>

						<button id="add-user-to-chat" onClick={addUserToNewChat}>Add this user to your chat</button>

						{warnUser === "noUserWithThisUsername" &&

							<h2>There is no profile with this name</h2>

						}

						{warnUser === "userAlreadyInList" &&

							<h2>You already added this user</h2>

						}

						<h2>Users in your chat</h2>

						{usersOfNewChat.length === 1 ?

							<h3>No users yet, try adding one</h3>

							:

							usersOfNewChat.map((user, indexOfUsers) => {

								const addUserAsAdmin = () => {

									usersOfNewChat.splice(indexOfUsers, 1, [user[0], "admin"])

									forceUpdate()

								}

								const removeAdminPrivilegesToUser = () => {

									usersOfNewChat.splice(indexOfUsers, 1, [user[0], "noAdmin"])

									forceUpdate()

								}

								const removeUserFromChat = () => {

									setUsersOfNewChat(usersOfNewChat.filter(userToFilter => userToFilter !== user))

									forceUpdate()

								}

								return (

									<>

										<h3>{user[0]}</h3>

										{user[0] !== username && <button onClick={removeUserFromChat}>Remove this user</button>}

										{user[1] !== "admin" && user[0] !== username && <button onClick={addUserAsAdmin}>Give this user admin privileges</button>}

										{user[1] === "admin" && user[0] !== username && <button onClick={removeAdminPrivilegesToUser}>Remove admin privileges from this user</button>}

									</>

								)

							})

						}

						<br></br>

						<button onClick={createChat}>Create chat!</button>

					</div>

				}

				{chats.length > 0 && searchedChats.length === 0 && searchedChats !== "noChatsFound" &&


					chats.map(chat => {

						const redirectToChatRoom = () => {

							sessionStorage.setItem("nameOfChat", chat)

							window.location.href = `${localAddress}main-page/chat-page`

						}

						return (

							<div id="div-chat-display">

								<h2>{chat}</h2>

								<button id="access-chat-button" onClick={redirectToChatRoom}>Chat</button>

							</div>

						)

					})

				}
				{searchedChats.length > 0 && searchedChats !== "noChatsFound" &&

					searchedChats.map(chat => {

						const redirectToChatRoom = () => {

							sessionStorage.setItem("nameOfChat", chat)

							window.location.href = `${localAddress}main-page/chat-page`

						}

						return (

							<>

								<h2>{chat}</h2>

								<button onClick={redirectToChatRoom}>chat</button>

							</>

						)

					})

				}

				{searchedChats === "noChatsFound" && <h2>No chats found</h2>}

			</div>


		</div>

	)

}

export default BrowseChatsPage
