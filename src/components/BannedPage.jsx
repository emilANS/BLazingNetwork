
function BannedPage() {

	const localAddress = "http://localhost:5173/"

	const nameOfWhereUserIsBanned = sessionStorage.getItem("nameOfWhereUserIsBanned")

	return (

		<>

			<button onClick={() => {

				window.location.href = `${localAddress}main-page`

			}}>Go back to main page</button>

			<h1>You are banned from {nameOfWhereUserIsBanned}</h1>

		</>

	)

}

export default BannedPage
