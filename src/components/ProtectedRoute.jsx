import { Navigate, Outlet } from "react-router-dom"

function ProtectedRoute() {

	const isUserAuth = sessionStorage.getItem("userIsAuthenticated")

	// If user is authenticated let him continue
	if (isUserAuth === "ok!") {

		return <Outlet />

	} else {

		// If user is not authenticated send it to register
		return <Navigate to="/register" />

	}

}

export default ProtectedRoute
