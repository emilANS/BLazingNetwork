from flask import Flask, request, json

from flask_cors import CORS, cross_origin

from flask_socketio import SocketIO, join_room, leave_room, emit

import psycopg

import uuid

import base64

import time

app = Flask(__name__)

CORS(app)

socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

# The backend address is:  http://127.0.0.1:5000

frontend_address = "http://localhost:5173/"

# PostgreSQL database connection specifications
# Change password when project finished
conn = psycopg.connect(
    host="localhost",
    dbname="blazingDatabase",
    user="postgres",
    password="elbolicheelcabron123",
    port=5432,
)

cur = conn.cursor()

# Creating all tables needed for the page to run well
# In this table user information will be stored as username, email and password etc...
cur.execute(
    """
    CREATE TABLE IF NOT EXISTS user_information (

            id VARCHAR(50),
            username VARCHAR (30),
            email VARCHAR (100),
            password VARCHAR (30),
            liked_comments_replies_posts VARCHAR[],
            disliked_comments_replies_posts VARCHAR[],
            saved_posts VARCHAR[],
            admin_of VARCHAR[],
            moderator_of VARCHAR[],
            banned_from VARCHAR[],
            following_communities VARCHAR[],
            chats_id VARCHAR[],
            profile_photo VARCHAR(200),
            admin_of_chats VARCHAR[],
            user_likes VARCHAR[]

    );
    """
)

conn.commit()

cur.execute(
    """

    CREATE TABLE IF NOT EXISTS communities (

        id VARCHAR(50),
        name VARCHAR(50),
        description VARCHAR(1000),
        admins VARCHAR[],
        moderators VARCHAR[],
        members INTEGER,
        rules VARCHAR(1000),
        release_date VARCHAR(70),
        community_icon VARCHAR

    )

"""
)

# creating post_information tables here all information about posts will be stored
cur.execute(
    """
    CREATE TABLE IF NOT EXISTS post_information (

        id VARCHAR(50),
        title VARCHAR(300),
        body VARCHAR(1000),
        images_and_videos_path VARCHAR,
        likes INTEGER,
        community VARCHAR(70),
        author VARCHAR(30),
        date_of_post DATE NOT NULL

    );
    """
)

conn.commit()

# Here all comments of every post will be stored
cur.execute(
    """
    CREATE TABLE IF NOT EXISTS comments_of_post (
        id_of_comment VARCHAR(50),
        id_of_post VARCHAR(50),
        content VARCHAR(1000),
        images_and_videos_path VARCHAR,
        author VARCHAR(30),
        likes INTEGER
    )

    """
)

conn.commit()

cur.execute(
    """

    CREATE TABLE IF NOT EXISTS replies (
        id_of_comment VARCHAR(50),
        id_of_post VARCHAR(50),
        id_of_reply VARCHAR(50),
        content VARCHAR(1000),
        images_and_videos_path VARCHAR,
        author VARCHAR(30),
        likes INTEGER
    )

    """
)

conn.commit()


cur.execute(
    """
    CREATE TABLE IF NOT EXISTS chat (

    id_of_chat VARCHAR(50),
    name_of_chat VARCHAR(70),
    users VARCHAR[],
    messages VARCHAR[],
    admins_usernames VARCHAR[]

    )

    """
)

conn.commit()


# Address to make an account in the database
@app.route("/register-user", methods=["POST"])
@cross_origin()
def register_user():
    JSON_received = request.get_json()["params"]

    # Credentials of user to register
    username = JSON_received["username"]

    email = JSON_received["email"]

    password = JSON_received["password"]

    profile_image = JSON_received["profileImage"]

    uuid_of_user = str(uuid.uuid4())

    cur.execute(
        "SELECT EXISTS(SELECT 1 FROM user_information WHERE username = (%s) AND email = (%s) AND password = (%s))",
        (username, email, password),
    )

    # if credentials are correct send user to main page
    do_credentials_already_exists = cur.fetchone()

    cur.execute(
        "SELECT EXISTS(SELECT 1 FROM user_information WHERE username = (%s))",
        [username],
    )

    # if username exists advert user
    do_username_exists = cur.fetchone()

    cur.execute(
        "SELECT EXISTS(SELECT 1 FROM user_information WHERE email = (%s))",
        [email],
    )

    # if email exists advert user
    do_email_already_exists = cur.fetchone()

    # If user leave some input empty advert about it
    if (
        username.replace(" ", "") == ""
        or email.replace(" ", "") == ""
        or password.replace(" ", "") == ""
    ):

        return "checkIfInputsAreEmpty"

    # if user put an existing account to register advert about it
    elif do_credentials_already_exists[0] == True:

        return "credentialsAlreadyExist"

    # if user put an existing username to register advert about it
    elif do_username_exists[0] == True:

        return "usernameAlreadyExists"

    # if user put an existing email to register advert about it
    elif do_email_already_exists[0] == True:

        return "emailAlreadyExists"

    # if finally the credentials are correct send him to login in the frontend
    else:

        if profile_image == "noImage":

            # Inserting the credentials to make an account in the database
            cur.execute(
                "INSERT INTO user_information (id, username, email, password, profile_photo) VALUES (%s, %s, %s, %s, %s);",
                (
                    uuid_of_user,
                    username,
                    email,
                    password,
                    "default_images/default_profile_image.png",
                ),
            )

            conn.commit()

        else:

            if len(profile_image) != 0:

                id_of_image = str(uuid.uuid4())

                path_to_profile_image = "profile_images/" + id_of_image + ".png"

                # Make all base64 to image format and store it in profile_images folder
                with open(path_to_profile_image, "wb") as f:
                    f.write(base64.b64decode(profile_image.split(",")[1]))

                # Inserting the credentials to make an account in the database
                cur.execute(
                    "INSERT INTO user_information (id, username, email, password, profile_photo) VALUES (%s, %s, %s, %s, %s);",
                    (uuid_of_user, username, email, password, path_to_profile_image),
                )

                conn.commit()

            else:

                return "noValidProfileImage"

        return "Sended!"


# Address to login user to main page of the website
@app.route("/login-user", methods=["POST"])
@cross_origin()
def login_user():

    JSON_received = request.get_json()["params"]

    # Credentials of user to login
    username = JSON_received["username"]

    email = JSON_received["email"]

    password = JSON_received["password"]

    # Selecting credentials in db to verify if user exists

    cur.execute(
        "SELECT EXISTS(SELECT 1 FROM user_information WHERE username = (%s) AND email = (%s) AND password = (%s))",
        (username, email, password),
    )

    # Do credentials exists if it exists redirect to main page if not make user try again
    result = cur.fetchone()

    # If credentials exists login user
    if result[0] == True:
        return "correct"

    # If Credentials don't exists advert user about it
    else:
        return "invalidCredentials"


@app.route("/change-profile-image", methods=["POST"])
@cross_origin()
def change_profile_image():

    JSON_received = request.get_json()["params"]

    new_profile_image = JSON_received["newProfileImageBase64"]

    username = JSON_received["username"]

    id_of_image = str(uuid.uuid4())

    path_to_profile_image = "profile_images/" + id_of_image + ".png"

    # Make all base64 to image format and store it in profile_images folder
    with open(path_to_profile_image, "wb") as f:
        f.write(base64.b64decode(new_profile_image.split(",")[1]))

    cur.execute(
        "UPDATE user_information SET profile_photo = %s WHERE username = %s",
        [path_to_profile_image, username],
    )

    conn.commit()

    return "Sended!"


@app.route("/change-user-credentials", methods=["POST"])
@cross_origin()
def change_user_credentials():

    JSON_received = request.get_json()["params"]

    # User information old credentials, new credentials
    old_username = JSON_received["oldUsername"]

    old_password = JSON_received["oldPassword"]

    new_username = JSON_received["newUsername"]

    new_email = JSON_received["newEmail"]

    new_password = JSON_received["newPassword"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [old_username, old_password],
    )

    user_old_credentials = cur.fetchone()

    print("old", user_old_credentials)

    if len(user_old_credentials) == 1:

        cur.execute(
            "SELECT username FROM user_information WHERE username = %s", [new_username]
        )

        if cur.fetchone() is None:

            cur.execute(
                "SELECT chats_id FROM user_information WHERE username = %s",
                [old_username],
            )

            list_of_chats_ids = cur.fetchone()[0]

            if list_of_chats_ids is not None:

                for id in list_of_chats_ids:

                    cur.execute(
                        "UPDATE chat SET users = array_replace(users, %s, %s) WHERE id_of_chat = %s",
                        [old_username, new_username, id],
                    )

                    conn.commit()

            cur.execute(
                "UPDATE user_information SET username = %s, email = %s, password = %s WHERE username = %s",
                [new_username, new_email, new_password, old_username],
            )

            conn.commit()

            return "credentialsChanged"

        else:

            return "alreadyExistingUsername"
    else:

        return "invalidUsernameOrPassword"


# Search function to send to frontend the information user searched about
@app.route("/search", methods=["GET"])
@cross_origin()
def search():

    # Get all request info
    JSON_received = request.args.to_dict()

    # Get search query user made
    search_query = JSON_received["searchedInfo"]

    # Get similar values in database
    cur.execute(
        "SELECT * FROM user_information WHERE username LIKE %s",
        ["%" + search_query + "%"],
    )

    # Get all results
    profile_search_results = cur.fetchall()

    # Return results of search
    return json.dumps(profile_search_results)


@app.route("/search-posts", methods=["GET"])
@cross_origin()
def search_posts():

    JSON_received = request.args.to_dict()

    search_query = JSON_received["searchQuery"]

    cur.execute("SELECT * FROM post_information WHERE body LIKE %s OR title LIKE %s", [search_query, search_query])

    similar_posts = cur.fetchall()

    return similar_posts


@app.route("/get-user-id-by-username", methods=["GET"])
@cross_origin()
def get_user_id_by_username():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    cur.execute("SELECT id FROM user_information WHERE username = %s", [username])

    id_of_user = cur.fetchone()[0]

    return id_of_user


@app.route("/create-post", methods=["POST"])
@cross_origin()
def create_post():

    # Json received from frontend
    JSON_received = request.get_json()["params"]

    # Type of the post user choose
    type_of_post = JSON_received["typeOfPost"]

    check_len_title = len(JSON_received["title"])

    check_len_body = len(JSON_received["body"])

    # Author of the post
    author = JSON_received["author"]

    # Password of the author
    password = JSON_received["password"]

    # Community of post
    community = JSON_received["community"]

    # Check if user is really subscribed to the community
    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s AND %s = ANY(following_communities)",
        [author, password, community],
    )

    do_user_subscribed_to_community = cur.fetchone()

    if (
        check_len_title > 0
        and check_len_body > 0
        and community != ""
        and do_user_subscribed_to_community is not None
    ):

        # If user choose a text post do this
        if type_of_post == "text":

            # Title of the post
            title = JSON_received["title"]

            # Body text of the post
            body = JSON_received["body"]

            # Id of post
            id_of_post = str(uuid.uuid4())

            cur.execute(
                "SELECT username FROM user_information WHERE username = %s AND password = %s",
                [author, password],
            )

            is_user_valid = cur.fetchone()

            if is_user_valid is not None and is_user_valid[0] == author:

                # Insert all previous values into database
                cur.execute(
                    "INSERT INTO post_information (id, title, body, images_and_videos_path, likes, community, author, date_of_post) VALUES (%s, %s, %s, 'noImageAndVideo', 0, %s, %s, NOW())",
                    [id_of_post, title, body, community, author],
                )

                # Commit all!
                conn.commit()

        else:

            # Title of post
            title = JSON_received["title"]

            # Images of post
            images = JSON_received["images"]

            # Videos of post
            videos = JSON_received["videos"]

            # Path to all multimedia they will be separated with their file format
            path_to_multimedia = []

            # All images and videos will be stored in images_and_videos folder inside of backend folder

            # If there are any images in images variables do this
            if len(images) > 0:

                # Iterate every images
                for image in images:

                    # Put the id of image as name
                    id_of_image = str(uuid.uuid4())

                    # Path of images
                    path_to_multimedia.append(
                        ["image", "images_and_videos/" + id_of_image + ".png"]
                    )

                    # Make all base64 to image format and store it in images_and_videos folder
                    with open("images_and_videos/" + id_of_image + ".png", "wb") as f:
                        f.write(base64.b64decode(image.split(",")[1]))

            if len(videos) > 0:

                for video in videos:

                    # Id of each video
                    id_of_video = str(uuid.uuid4())

                    # Path of videos
                    path_to_multimedia.append(
                        ["video", "images_and_videos/" + id_of_video + ".mp4"]
                    )

                    # Make all base64 to video format and store it in images_and_videos folder
                    with open("images_and_videos/" + id_of_video + ".mp4", "wb") as f:
                        f.write(base64.b64decode(video.split(",")[1]))

            cur.execute(
                "SELECT username FROM user_information WHERE username = %s AND password = %s",
                [author, password],
            )

            is_user_valid = cur.fetchone()

            if is_user_valid is not None and is_user_valid[0] == author:

                # Id of the post
                id_of_post = str(uuid.uuid4())

                # Insert all previous values into database
                cur.execute(
                    "INSERT INTO post_information (id, title, body, images_and_videos_path, likes, community, author, date_of_post) VALUES (%s, %s, 'imageAndVideoPost', %s, 0, %s, %s, NOW())",
                    [
                        id_of_post,
                        title,
                        json.dumps(path_to_multimedia),
                        community,
                        author,
                    ],
                )

                # Commit all!!
                conn.commit()
    else:

        return "invalidData"

    return "Sended!"


@app.route("/delete-post", methods=["POST"])
@cross_origin()
def delete_post():

    JSON_received = request.get_json()["params"]

    id_of_post = JSON_received["id"]

    # Delete all information about post comments, replies and post
    cur.execute("DELETE FROM post_information WHERE id = %s", [id_of_post])

    conn.commit()

    cur.execute("DELETE FROM comments_of_post WHERE id_of_post = %s", [id_of_post])

    conn.commit()

    cur.execute("DELETE FROM replies WHERE id_of_post = %s", [id_of_post])

    conn.commit()

    return "Sended!"


@app.route("/save-post", methods=["POST"])
@cross_origin()
def save_post():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    id_of_post = JSON_received["idOfPost"]

    cur.execute(
        "UPDATE user_information SET saved_posts = array_append(saved_posts, %s) WHERE username = (%s)",
        [id_of_post, username],
    )

    conn.commit()

    return "Sended!"


@app.route("/show-saved-posts", methods=["GET"])
@cross_origin()
def show_saved_posts():

    # Json received from frontend
    JSON_received = request.args.to_dict()

    # username of user
    username = JSON_received["username"]

    # Select all saved posts user have using the username of user
    cur.execute(
        "SELECT saved_posts FROM user_information WHERE username = (%s)", [username]
    )

    # All the saved posts user have
    saved_posts_id = cur.fetchall()

    # Here will be stored all the posts information thanks to the id that was used before
    post_information = []

    # Iterate over all the ids
    for posts_id in saved_posts_id[0][0]:

        # Select all posts where the id is posts_id
        cur.execute("SELECT * FROM post_information WHERE id = (%s)", [posts_id])

        # Append to post_information all the post information user saved
        post_information.append(list(cur.fetchone()))

    # Return it to frontend!
    return post_information


@app.route("/show-posts", methods=["GET"])
@cross_origin()
def show_posts():

    # Getting json from GET request
    JSON_received = request.args.to_dict()

    # This works for knowing in what part of the page user is in and show them the correspondent posts
    type_of_request = JSON_received["type"]

    username = JSON_received["username"]

    use_recommendations = False

    try:

        # Opening recomemndation results text file
        recommendation_results = open(
            "./recommendation_system/results_of_recommendation_system.txt", "r"
        )

        # Make it a python list
        recommendation_results_parsed = eval(recommendation_results.read())

        cur.execute(
            "SELECT row_index FROM (SELECT ROW_NUMBER() OVER (ORDER BY username ASC) AS row_index, username FROM user_information) subquery WHERE username = %s",
            [username],
        )

        user_index_in_db = cur.fetchone()[0] - 1

        if len(recommendation_results_parsed) - 1 >= user_index_in_db:

            recommendations = []

            for similarity_index in range(
                len(recommendation_results_parsed[user_index_in_db])
            ):

                metrics_of_user = recommendation_results_parsed[0][similarity_index]

                if similarity_index != user_index_in_db and metrics_of_user >= 0.40:

                    cur.execute(
                        "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY username ASC) as row_index, user_likes FROM user_information) subquery WHERE row_index = %s",
                        [similarity_index + 1],
                    )

                    recommendations = cur.fetchone()[1]

                    use_recommendations = True

        total_zeroes_count = 0

        for index in range(len(recommendation_results_parsed[user_index_in_db])):

            if (
                recommendation_results_parsed[user_index_in_db][index] == 0.0
                and index != user_index_in_db
            ):

                total_zeroes_count += 1

        if (
            total_zeroes_count
            >= len(recommendation_results_parsed[user_index_in_db]) - 1
        ):

            use_recommendations = False

    except FileNotFoundError:

        pass

    # If user is in his profile page show his publications
    # Use recommendation system

    if type_of_request == "userProfilePage":

        # Getting the author of the posts that is the same user
        author = JSON_received["username"]

        # Select all his posts
        cur.execute("SELECT * FROM post_information WHERE author = %s", [author])

        # Posts information
        posts = cur.fetchall()

        # Send it to frontend
        return posts

    # Use recommendation system
    if type_of_request == "mainPage" and use_recommendations is True:

        # Select all post information with a limit of 3 posts
        cur.execute(
            "SELECT * FROM post_information ORDER BY CASE WHEN community = ANY(%s) THEN 1 ELSE 2 END, community LIMIT 6",
            [recommendations],
        )

        # All the posts information
        posts = cur.fetchall()

        # Sending posts to frontend
        return posts

    elif type_of_request == "mainPage" and use_recommendations is False:

        # Select all post information with a limit of 3 posts
        cur.execute("SELECT * FROM post_information LIMIT 6")

        # All the posts information
        posts = cur.fetchall()

        # Sending posts to frontend
        return posts


@app.route("/send-more-posts", methods=["POST"])
@cross_origin()
def send_more_posts():

    # Getting json from frontend request
    JSON_received = request.get_json()["params"]

    # Id of all posts user have
    id_of_posts = JSON_received["idOfPosts"]

    type = JSON_received["type"]

    type_of_sort = JSON_received["typeOfSort"]

    username = JSON_received["username"]

    use_recommendations = False

    try:

        # Opening recomemndation results text file
        recommendation_results = open(
            "./recommendation_system/results_of_recommendation_system.txt", "r"
        )

        # Make it a python list
        recommendation_results_parsed = eval(recommendation_results.read())

        cur.execute(
            "SELECT row_index FROM (SELECT ROW_NUMBER() OVER (ORDER BY username ASC) AS row_index, username FROM user_information) subquery WHERE username = %s",
            [username],
        )

        user_index_in_db = cur.fetchone()[0] - 1

        if len(recommendation_results_parsed) - 1 >= user_index_in_db:

            recommendations = []

            for similarity_index in range(
                len(recommendation_results_parsed[user_index_in_db])
            ):

                metrics_of_user = recommendation_results_parsed[0][similarity_index]

                if similarity_index != user_index_in_db and metrics_of_user >= 0.40:

                    cur.execute(
                        "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY username ASC) as row_index, user_likes FROM user_information) subquery WHERE row_index = %s",
                        [similarity_index + 1],
                    )

                    recommendations = cur.fetchone()[1]

                    use_recommendations = True

        total_zeroes_count = 0

        for index in range(len(recommendation_results_parsed[user_index_in_db])):

            if (
                recommendation_results_parsed[user_index_in_db][index] == 0.0
                and index != user_index_in_db
            ):

                total_zeroes_count += 1

        if (
            total_zeroes_count
            >= len(recommendation_results_parsed[user_index_in_db]) - 1
        ):

            use_recommendations = False

    except FileNotFoundError:

        pass

    if type == "mainPage" and use_recommendations is True:

        query_in_proccess_community = ["SELECT id FROM post_information WHERE"]

        for index in range(len(id_of_posts)):

            if index == 0:
                query_in_proccess_community.append(f" id != '{id_of_posts[index]}'")
            else:
                query_in_proccess_community.append(f" AND id != '{id_of_posts[index]}'")

        if type_of_sort == "Newest":

            query_in_proccess_community.append(" ORDER BY date_of_post DESC LIMIT 6")

        if type_of_sort == "Popular":

            query_in_proccess_community.append(" ORDER BY likes DESC LIMIT 6")

        if type_of_sort == "Newest and popular":

            query_in_proccess_community.append(
                " ORDER BY likes, date_of_post DESC LIMIT 6"
            )

        if type_of_sort == "Oldest":

            query_in_proccess_community.append(" ORDER BY date_of_post ASC LIMIT 6")

        if type_of_sort == "normal":

            query_in_proccess_community[0].replace("WHERE", "")

        cur.execute("".join(query_in_proccess_community))

        posts_id = cur.fetchall()

        posts_id_only_array = []

        for id in posts_id:

            posts_id_only_array.append(id[0])

        cur.execute(
            "SELECT * FROM post_information WHERE id = ANY(%s) ORDER BY CASE WHEN community = ANY(%s) THEN 1 ELSE 2 END, community LIMIT 6",
            [posts_id_only_array, recommendations],
        )

        posts = cur.fetchall()

        return posts

    if type == "mainPage" and use_recommendations is False:

        query_in_proccess_community = ["SELECT * FROM post_information WHERE"]

        for index in range(len(id_of_posts)):

            if index == 0:
                query_in_proccess_community.append(f" id != '{id_of_posts[index]}'")
            else:
                query_in_proccess_community.append(f" AND id != '{id_of_posts[index]}'")

        if type_of_sort == "Newest":

            query_in_proccess_community.append(" ORDER BY date_of_post DESC LIMIT 6")

        if type_of_sort == "Popular":

            query_in_proccess_community.append(" ORDER BY likes DESC LIMIT 6")

        if type_of_sort == "Newest and popular":

            query_in_proccess_community.append(
                " ORDER BY likes, date_of_post DESC LIMIT 6"
            )

        if type_of_sort == "Oldest":

            query_in_proccess_community.append(" ORDER BY date_of_post ASC LIMIT 6")

        cur.execute("".join(query_in_proccess_community))

        posts = cur.fetchall()

        print(posts)

        return posts

    elif type == "communityPage":

        community_name = JSON_received["communityName"]

        query_in_proccess_community = ["SELECT * FROM post_information WHERE"]

        for index in range(len(id_of_posts)):
            if index == 0:
                query_in_proccess_community.append(f" id != '{id_of_posts[index]}'")
            else:
                query_in_proccess_community.append(f" AND id != '{id_of_posts[index]}'")

        if type_of_sort == "normal":

            query_in_proccess_community.append(
                f" AND community = '{community_name}' LIMIT 6"
            )

        if type_of_sort == "Newest":

            query_in_proccess_community.append(
                f" AND community = '{community_name}' ORDER BY date_of_post DESC LIMIT 6"
            )

        if type_of_sort == "Popular":

            query_in_proccess_community.append(
                f" AND community = '{community_name}' ORDER BY likes DESC LIMIT 6"
            )

        if type_of_sort == "Newest and popular":

            query_in_proccess_community.append(
                f" AND community = '{community_name}' ORDER BY likes, date_of_post DESC LIMIT 6"
            )

        if type_of_sort == "Oldest":

            query_in_proccess_community.append(
                f" AND community = '{community_name}' ORDER BY date_of_post ASC LIMIT 6"
            )

        cur.execute("".join(query_in_proccess_community))

        posts = cur.fetchall()

        return posts


@app.route("/send-like-to-post", methods=["POST"])
@cross_origin()
def send_like_to_post():

    # Json received from frontend request
    JSON_received = request.get_json()["params"]

    # Id of the post user liked
    id_of_post = JSON_received["idOfPost"]

    # Username of user that liked
    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    community_name = JSON_received["communityName"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    if is_user_valid is not None and is_user_valid[0] == username:

        # Select all the liked comments replies or posts user have
        cur.execute(
            "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        # Fetch the anterior select
        do_user_already_liked = cur.fetchone()[0]

        cur.execute(
            "SELECT disliked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        do_user_already_disliked = cur.fetchone()[0]

        # If user already liked is different to None then do this

        if do_user_already_disliked is not None:

            # Check if user already liked
            for id in do_user_already_disliked:

                if id == id_of_post:

                    cur.execute(
                        "UPDATE user_information SET disliked_comments_replies_posts = array_remove(disliked_comments_replies_posts, %s) WHERE username = %s",
                        [id, username],
                    )

                    conn.commit()

                    cur.execute(
                        "UPDATE user_information SET liked_comments_replies_posts = array_append(liked_comments_replies_posts, %s) WHERE username = %s",
                        [id, username],
                    )

                    conn.commit()

                    cur.execute(
                        "UPDATE post_information SET likes = likes + 2 WHERE id = %s",
                        [id_of_post],
                    )

                    conn.commit()

                    return "likeADisliked"

        if do_user_already_liked is not None:

            for id in do_user_already_liked:

                if id == id_of_post:

                    cur.execute(
                        "UPDATE user_information SET liked_comments_replies_posts = array_remove(liked_comments_replies_posts, %s) WHERE username = %s",
                        [id, username],
                    )

                    conn.commit()

                    cur.execute(
                        "UPDATE post_information SET likes = likes - 1 WHERE id = (%s)",
                        [id_of_post],
                    )

                    conn.commit()

                    return "likeRemoved"

        # If post wasn't already liked do this

        # Update the array where all the ids of the post user already liked are so it can't like again this post
        cur.execute(
            "UPDATE user_information SET liked_comments_replies_posts = array_append(liked_comments_replies_posts, %s) WHERE username = (%s)",
            [id_of_post, username],
        )

        conn.commit()

        # Update likes in post and add one more like
        cur.execute(
            "UPDATE post_information SET likes = likes + 1 WHERE id = (%s)",
            [id_of_post],
        )

        conn.commit()

        cur.execute(
            "SELECT user_likes FROM user_information WHERE username = %s", [username]
        )

        liked_communities = cur.fetchone()[0]

        print("Liked communities!", liked_communities)

        community_already_liked = False

        if liked_communities is not None:

            for liked_community in liked_communities:

                if liked_community == community_name:

                    community_already_liked = True

        if community_already_liked is False:

            # Put communities user has liked in user_likes array
            cur.execute(
                "UPDATE user_information SET user_likes = array_append(user_likes, %s) WHERE username = %s",
                [community_name, username],
            )

            conn.commit()

    # All done correctly!
    return "likeAdded"


@app.route("/send-dislike-to-post", methods=["POST"])
@cross_origin()
def send_dislike_to_post():

    # Json received from frontend request
    JSON_received = request.get_json()["params"]

    # id of the post user disliked
    id_of_post = JSON_received["idOfPost"]

    # Username of disliker
    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    print(is_user_valid)

    if is_user_valid is not None and is_user_valid[0] == username:

        # Select all the disliked comments replies posts from user so it can't dislike again if the user already disliked
        cur.execute(
            "SELECT disliked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        # Fetch it
        do_user_already_disliked = cur.fetchone()[0]

        cur.execute(
            "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        do_user_already_liked = cur.fetchone()[0]

        if do_user_already_liked is not None:

            # Check if user already liked
            for id in do_user_already_liked:

                if id == id_of_post:

                    cur.execute(
                        "UPDATE user_information SET liked_comments_replies_posts = array_remove(liked_comments_replies_posts, %s) WHERE username = %s",
                        [id, username],
                    )

                    conn.commit()

                    cur.execute(
                        "UPDATE user_information SET disliked_comments_replies_posts = array_append(disliked_comments_replies_posts, %s) WHERE username = %s",
                        [id, username],
                    )

                    conn.commit()

                    cur.execute(
                        "UPDATE post_information SET likes = likes - 2 WHERE id = %s",
                        [id_of_post],
                    )

                    conn.commit()

                    return "dislikedALiked"

        if do_user_already_disliked is not None:

            for id in do_user_already_disliked:

                if id == id_of_post:

                    cur.execute(
                        "UPDATE user_information SET disliked_comments_replies_posts = array_remove(disliked_comments_replies_posts, %s) WHERE username = %s",
                        [id, username],
                    )

                    conn.commit()

                    cur.execute(
                        "UPDATE post_information SET likes = likes + 1 WHERE id = %s",
                        [id_of_post],
                    )

                    conn.commit()

                    return "alreadyDisliked"

        # Update array where user liked comments replies posts are stored and add the new id to it
        cur.execute(
            "UPDATE user_information SET disliked_comments_replies_posts = array_append(disliked_comments_replies_posts, %s) WHERE username = (%s)",
            [id_of_post, username],
        )

        conn.commit()

        # Rest likes of post by one
        cur.execute(
            "UPDATE post_information SET likes = likes - 1 WHERE id = (%s)",
            [id_of_post],
        )

        conn.commit()

    return "disliked"


@app.route("/get-user-profile-image", methods=["GET"])
@cross_origin()
def get_user_profile_image():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    cur.execute(
        "SELECT profile_photo FROM user_information WHERE username = %s", [username]
    )

    profile_image = cur.fetchone()[0]

    return profile_image


@app.route("/show-comments", methods=["GET"])
@cross_origin()
def show_comments():

    # json received from request
    JSON_received = request.args.to_dict()

    # id of post where comments are
    id_of_post = JSON_received["idOfPost"]

    # Selecting all comments where post id is equal to id_of_post
    cur.execute("SELECT * FROM comments_of_post WHERE id_of_post = (%s)", [id_of_post])

    # All the comments selected
    comments = cur.fetchall()

    # Sending to frontend
    return comments


@app.route("/show-comments-profile", methods=["GET"])
@cross_origin()
def show_comments_profile():

    # Get Json received from frontend
    JSON_received = request.args.to_dict()

    # Username of the user
    username = JSON_received["username"]

    # Select all posts where the author is equal to the username of the user
    cur.execute("SELECT * FROM comments_of_post WHERE author = (%s)", [username])

    # Fetch it
    comments = cur.fetchall()

    # Here will be the comments from user with the title of the original post
    comments_processed = []

    # Iterate comments
    for index in range(len(comments)):

        # Append comments to cooments_processed
        comments_processed.append(list(comments[index]))

        # Select the title based on the id of the post
        cur.execute(
            "SELECT title FROM post_information WHERE id = (%s)", [comments[index][1]]
        )

        # Append the title of the post
        comments_processed[index].append(cur.fetchone()[0])

    return comments_processed


@app.route("/show-replies-profile", methods=["GET"])
@cross_origin()
def show_replies_profile():

    # Json Received from frontend request
    JSON_received = request.args.to_dict()

    # Username of user
    username = JSON_received["username"]

    # Select all replies where username is equal to the author
    cur.execute("SELECT * FROM replies WHERE author = (%s)", [username])

    # Fetch the replies
    replies = cur.fetchall()

    # Here will be the replies with the title of the original post
    replies_processed = []

    # Iterate replies array
    for index in range(len(replies)):

        # Append reply content to replies_processed
        replies_processed.append(list(replies[index]))

        # Select the title with the id of the reply
        cur.execute(
            "SELECT title FROM post_information WHERE id = (%s)", [replies[index][1]]
        )

        # Append the title to replies_processed
        replies_processed[index].append(cur.fetchone()[0])

    return replies_processed


@app.route("/send-post-information-with-a-comment", methods=["GET"])
@cross_origin()
def send_post_information_with_a_comment():

    # Json received from frontend
    JSON_received = request.args.to_dict()

    # Id of the post
    id_of_post = JSON_received["idOfPost"]

    # Select all the post information with the post id user choose
    cur.execute("SELECT * FROM post_information WHERE id = (%s)", [id_of_post])

    # Fetch the posts
    posts = cur.fetchall()

    # Return it to frontend
    return posts


@app.route("/send-post-information-with-a-reply", methods=["GET"])
@cross_origin()
def send_post_information_with_a_reply():

    # Json received from frontend
    JSON_received = request.args.to_dict()

    # Id of the post of the post user choose
    id_of_post = JSON_received["idOfPost"]

    # Select all the post information with the id of the post user choose
    cur.execute("SELECT * FROM post_information WHERE id = (%s)", [id_of_post])

    # Fetch post information
    posts = cur.fetchall()

    # Return it to frontend
    return posts


@app.route("/see-liked-posts-profile", methods=["GET"])
@cross_origin()
def see_liked_posts_profile():

    # Json received from frontend
    JSON_received = request.args.to_dict()

    # Username of user
    username = JSON_received["username"]

    # Select all liked posts where username is equal to the user username
    cur.execute(
        "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
        [username],
    )

    # All the liked posts ids
    liked_posts_ids = cur.fetchall()[0][0]

    # Ids of the posts with their titles
    title_of_posts = []

    # Iterate liked_posts_ids to get the ids
    for id in liked_posts_ids:

        # Select the title from post with id
        cur.execute("SELECT title FROM post_information WHERE id = (%s)", [id])

        # Title of the post
        titles = cur.fetchone()

        # If the titles are different than None
        if titles != None:

            # Append the titles to title_of_posts
            title_of_posts.append([titles[0], id])

    # Return it to frontend
    return title_of_posts


@app.route("/see-disliked-posts-profile", methods=["GET"])
@cross_origin()
def see_disliked_posts_profile():

    # Json received from frontend request
    JSON_received = request.args.to_dict()

    # Username of the user
    username = JSON_received["username"]

    # Select all disliked posts using user username
    cur.execute(
        "SELECT disliked_comments_replies_posts FROM user_information WHERE username = (%s)",
        [username],
    )

    # All disliked posts id
    disliked_posts_ids = cur.fetchall()[0][0]

    # id of the disliked posts with their titles
    title_of_posts = []

    # iterate every id of the disliked posts
    for id in disliked_posts_ids:

        # Select the title based on the id of the post
        cur.execute("SELECT title FROM post_information WHERE id = (%s)", [id])

        # Fetch the title
        titles = cur.fetchone()

        # If titles are different than one the program will do the if statement
        if titles is not None:

            # Append title of the post to title_of_posts
            title_of_posts.append([titles[0], id])

    # Send it to frontend
    return title_of_posts


@app.route("/send-comment", methods=["POST"])
@cross_origin()
def send_comment():

    # JSON reveived from request
    JSON_received = request.get_json()["params"]

    # Content of comment
    content = JSON_received["content"]

    # Author of comment
    author = JSON_received["author"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [author, password],
    )

    is_user_valid = cur.fetchone()

    print(is_user_valid)

    if is_user_valid is not None and is_user_valid[0] == author:

        # Images in comment
        images = JSON_received["images"]

        # Videos in comment
        videos = JSON_received["videos"]

        # Id of the post where coment is
        id_of_post = JSON_received["idOfPost"]

        # Id of the comment
        id_of_comment_generated = str(uuid.uuid4())

        # Path where all images and videos will be
        path_to_multimedia = []

        # If there are any images in images variables do this
        if len(images) > 0:

            # Iterate every images
            for image in images:

                # Put the id of image as name
                id_of_image = str(uuid.uuid4())

                # Path of images
                path_to_multimedia.append(
                    ["image", "images_and_videos/" + id_of_image + ".png"]
                )

                # Make all base64 to image format and store it in images_and_videos folder
                with open("images_and_videos/" + id_of_image + ".png", "wb") as f:
                    f.write(base64.b64decode(image.split(",")[1]))

        if len(videos) > 0:

            for video in videos:

                # Id of each video
                id_of_video = str(uuid.uuid4())

                # Path of videos
                path_to_multimedia.append(
                    ["video", "images_and_videos/" + id_of_video + ".mp4"]
                )

                # Make all base64 to video format and store it in images_and_videos folder
                with open("images_and_videos/" + id_of_video + ".mp4", "wb") as f:
                    f.write(base64.b64decode(video.split(",")[1]))

        # Inserting comment into comments_of_post
        cur.execute(
            "INSERT INTO comments_of_post (id_of_comment, id_of_post, content, images_and_videos_path, author, likes) VALUES (%s, %s, %s, %s, %s, 0)",
            [
                id_of_comment_generated,
                id_of_post,
                content,
                json.dumps(path_to_multimedia),
                author,
            ],
        )

        conn.commit()

    return "Sended!"


@app.route("/delete-comment", methods=["POST"])
@cross_origin()
def delete_comment():

    JSON_received = request.get_json()["params"]

    id_of_comment = JSON_received["id"]

    cur.execute(
        "DELETE FROM comments_of_post WHERE id_of_comment = %s", [id_of_comment]
    )

    conn.commit()

    cur.execute("DELETE FROM replies WHERE id_of_comment = %s", [id_of_comment])

    conn.commit()

    return "Sended!"


@app.route("/send-like-to-comment", methods=["POST"])
@cross_origin()
def send_like_to_comment():

    # JSON received from frontend request
    JSON_received = request.get_json()["params"]

    # Username of user
    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    print(is_user_valid)

    if is_user_valid is not None and is_user_valid[0] == username:

        # Id of user
        id = JSON_received["id"]

        # Select all liked comments by user
        cur.execute(
            "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        do_user_already_liked = cur.fetchone()[0]

        # See if liked comment was not already liked
        if do_user_already_liked is not None:
            for each_id in do_user_already_liked:

                # If id is equal to the id of user liked comments return as already liked
                if each_id == id:

                    return "alreadyLiked"

        cur.execute(
            "SELECT likes FROM comments_of_post WHERE id_of_comment = (%s)", [id]
        )

        likes = cur.fetchone()[0]

        cur.execute(
            "UPDATE user_information SET liked_comments_replies_posts = array_append(liked_comments_replies_posts, %s) WHERE username = (%s)",
            [id, username],
        )

        conn.commit()

        cur.execute(
            "UPDATE comments_of_post SET likes = (%s) WHERE id_of_comment = (%s)",
            [likes + 1, id],
        )

        conn.commit()

    return "Sended!"


@app.route("/send-dislike-to-comment", methods=["POST"])
@cross_origin()
def send_dislike_to_comment():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    if is_user_valid is not None and is_user_valid[0] == username:

        id = JSON_received["id"]

        cur.execute(
            "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        do_user_already_liked = cur.fetchone()[0]

        if do_user_already_liked is not None:
            for each_id in do_user_already_liked:

                if each_id == id:

                    return "alreadyLiked"

        cur.execute(
            "SELECT likes FROM comments_of_post WHERE id_of_comment = (%s)", [id]
        )

        likes = cur.fetchone()[0]

        cur.execute(
            "UPDATE user_information SET liked_comments_replies_posts = array_append(liked_comments_replies_posts, %s) WHERE username = (%s)",
            [id, username],
        )

        conn.commit()

        cur.execute(
            "UPDATE comments_of_post SET likes = (%s) WHERE id_of_comment = (%s)",
            [likes - 1, id],
        )

        conn.commit()

    return "Sended!"


@app.route("/send-reply", methods=["POST"])
@cross_origin()
def send_reply():

    JSON_received = request.get_json()["params"]

    content = JSON_received["content"]

    author = JSON_received["author"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [author, password],
    )

    is_user_valid = cur.fetchone()

    if is_user_valid is not None and is_user_valid[0] == author:

        images = JSON_received["images"]

        videos = JSON_received["videos"]

        id_of_post = JSON_received["idOfPost"]

        id_of_comment = JSON_received["idOfComment"]

        id_of_reply = str(uuid.uuid4())

        path_to_multimedia = []

        # If there are any images in images variables do this
        if len(images) > 0:

            # Iterate every images
            for image in images:

                # Put the id of image as name
                id_of_image = str(uuid.uuid4())

                # Path of images
                path_to_multimedia.append(
                    ["image", "images_and_videos/" + id_of_image + ".png"]
                )

                # Make all base64 to image format and store it in images_and_videos folder
                with open("images_and_videos/" + id_of_image + ".png", "wb") as f:
                    f.write(base64.b64decode(image[1].split(",")[1]))

        if len(videos) > 0:

            for video in videos:

                # Id of each video
                id_of_video = str(uuid.uuid4())

                # Path of videos
                path_to_multimedia.append(
                    ["video", "images_and_videos/" + id_of_video + ".mp4"]
                )

                # Make all base64 to video format and store it in images_and_videos folder
                with open("images_and_videos/" + id_of_video + ".mp4", "wb") as f:
                    f.write(base64.b64decode(video[1].split(",")[1]))

        # Inserting into replies all information
        cur.execute(
            "INSERT INTO replies (id_of_comment, id_of_reply, id_of_post, content, images_and_videos_path, author, likes) VALUES (%s, %s, %s, %s, %s, %s, 0)",
            [
                id_of_comment,
                id_of_reply,
                id_of_post,
                content,
                json.dumps(path_to_multimedia),
                author,
            ],
        )

        conn.commit()

    return "Sended!"


@app.route("/delete-reply", methods=["POST"])
@cross_origin()
def delete_reply():

    JSON_received = request.get_json()["params"]

    id_of_reply = JSON_received["id"]

    cur.execute("DELETE FROM replies WHERE id_of_reply = %s", [id_of_reply])

    conn.commit()

    return "Sended!"


@app.route("/send-like-to-reply", methods=["POST"])
@cross_origin()
def send_like_to_reply():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    print(is_user_valid)

    if is_user_valid is not None and is_user_valid[0] == username:

        id = JSON_received["id"]

        cur.execute(
            "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        do_user_already_liked = cur.fetchone()[0]

        if do_user_already_liked is not None:
            for each_id in do_user_already_liked:

                if each_id == id:

                    return "alreadyLiked"

        cur.execute("SELECT likes FROM replies WHERE id_of_reply = (%s)", [id])

        likes = cur.fetchone()[0]

        cur.execute(
            "UPDATE user_information SET liked_comments_replies_posts = array_append(liked_comments_replies_posts, %s) WHERE username = (%s)",
            [id, username],
        )

        conn.commit()

        cur.execute(
            "UPDATE replies SET likes = (%s) WHERE id_of_reply = (%s)",
            [likes + 1, id],
        )

        conn.commit()

    return "Sended!"


@app.route("/send-dislike-to-reply", methods=["POST"])
@cross_origin()
def send_dislike_to_reply():

    # Getting json from frontend
    JSON_received = request.get_json()["params"]

    # Username of user
    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    if is_user_valid is not None and is_user_valid[0] == username:

        # Id of user
        id = JSON_received["id"]

        # Select liked replies comments posts based on username
        cur.execute(
            "SELECT liked_comments_replies_posts FROM user_information WHERE username = (%s)",
            [username],
        )

        do_user_already_liked = cur.fetchone()[0]

        if do_user_already_liked is not None:

            for each_id in do_user_already_liked:

                if each_id == id:

                    return "alreadyLiked"

        cur.execute("SELECT likes FROM replies WHERE id_of_reply = (%s)", [id])

        likes = cur.fetchone()[0]

        cur.execute(
            "UPDATE user_information SET liked_comments_replies_posts = array_append(liked_comments_replies_posts, %s) WHERE username = (%s)",
            [id, username],
        )

        conn.commit()

        cur.execute(
            "UPDATE replies SET likes = (%s) WHERE id_of_reply = (%s)",
            [likes - 1, id],
        )

        conn.commit()

    return "Sended!"


@app.route("/show-replies", methods=["GET"])
@cross_origin()
def show_replies():

    # Get json received in request
    JSON_received = request.args.to_dict()

    # Id of the post
    id_of_post = JSON_received["idOfPost"]

    # Select all replies where id of post is equal to the id_of_post variable
    cur.execute("SELECT * FROM replies WHERE id_of_post = (%s)", [id_of_post])

    # Variable with all replies
    replies = cur.fetchall()

    # Send replies
    return replies


@app.route("/create-community", methods=["POST"])
@cross_origin()
def create_community():

    JSON_received = request.get_json()["params"]

    name_of_community = JSON_received["nameOfCommunity"]

    description_of_community = JSON_received["descriptionOfCommunity"]

    rules_of_community = JSON_received["rulesOfCommunity"]

    id_of_community = str(uuid.uuid4())

    admin = JSON_received["admin"]

    date = time.strftime("%m/%d/%Y")

    # Here the icon of the community will be processed
    icon_of_community = JSON_received["iconBase64"]

    # Put the id of image as name
    id_of_image = str(uuid.uuid4())

    # Path of images
    path_to_multimedia = "communities_icons/" + id_of_image + ".png"

    # Make all base64 to image format and store it in images_and_videos folder
    with open(path_to_multimedia, "wb") as f:
        f.write(base64.b64decode(icon_of_community.split(",")[1]))

    cur.execute(
        "INSERT INTO communities (id, name, description, admins, members, rules, release_date, community_icon) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        [
            id_of_community,
            name_of_community,
            description_of_community,
            "{" + admin + "}",
            0,
            rules_of_community,
            date,
            path_to_multimedia,
        ],
    )

    conn.commit()

    cur.execute(
        "UPDATE user_information SET admin_of = array_append(admin_of, %s) WHERE username = (%s)",
        [name_of_community, admin],
    )

    conn.commit()

    cur.execute(
        "SELECT members FROM communities WHERE name = (%s)", [name_of_community]
    )

    add_one_follower = cur.fetchone()[0] + 1

    cur.execute(
        "UPDATE communities SET members = %s WHERE name = (%s)",
        [add_one_follower, name_of_community],
    )

    conn.commit()

    cur.execute(
        "UPDATE user_information SET following_communities = array_append(following_communities, %s) WHERE username = %s",
        [name_of_community, admin],
    )

    conn.commit()

    return "Sended!"


@app.route("/show-icon-of-community-to-user", methods=["GET"])
@cross_origin()
def show_icon_of_community_to_user():

    JSON_received = request.args.to_dict()

    community_name = JSON_received["communityName"]

    cur.execute(
        "SELECT community_icon FROM communities WHERE name = %s", [community_name]
    )

    return cur.fetchone()[0]


@app.route("/show-community-user-is-subscribed", methods=["GET"])
@cross_origin()
def show_community_user_is_subscribed():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    cur.execute(
        "SELECT following_communities FROM user_information WHERE username = %s",
        [username],
    )

    list_of_following_communities = cur.fetchone()[0]

    if list_of_following_communities is not None:

        return list_of_following_communities

    else:

        return "noFollowedCommunitiesYet"


@app.route("/show-created-communities-to-admins", methods=["GET"])
@cross_origin()
def show_created_communities_to_admins():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    cur.execute(
        "SELECT admin_of FROM user_information WHERE username = (%s)", [username]
    )

    names_of_communities_user_is_admin = cur.fetchone()[0]

    if names_of_communities_user_is_admin is not None:

        information_of_each_community = []

        for names in names_of_communities_user_is_admin:

            cur.execute("SELECT * FROM communities WHERE name = (%s)", [names])

            information_of_each_community.append(cur.fetchone())

        return information_of_each_community

    return "adminOfNone"


@app.route("/show-communities-where-user-is-moderator", methods=["POST"])
@cross_origin()
def show_communities_where_user_is_moderator():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    cur.execute(
        "SELECT moderator_of FROM user_information WHERE username = %s", [username]
    )

    moderator_in = cur.fetchone()

    communities_information = []

    if moderator_in[0] is not None:

        for moderator in moderator_in[0]:

            cur.execute("SELECT * FROM communities WHERE name = %s", [moderator])

            communities_information.append(cur.fetchone())

    return communities_information


@app.route("/add-admin-or-moderator", methods=["POST"])
@cross_origin()
def add_admin_or_moderator():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    type_of_privilege = JSON_received["typeOfPrivilege"]

    community_name = JSON_received["communityName"]

    if type_of_privilege == "admin":

        cur.execute(
            "SELECT username FROM user_information WHERE username = %s", [username]
        )

        if cur.fetchone() is None:

            return "noProfileWithThisName"

        cur.execute(
            "SELECT moderators FROM communities WHERE name = %s", [community_name]
        )

        moderators = cur.fetchone()[0]

        if moderators is not None:

            for moderator in moderators:

                if username == moderator:

                    return "alreadyModerator"

        cur.execute(
            "SELECT admin_of FROM user_information WHERE username = %s", [username]
        )

        admin_of_list = cur.fetchone()[0]

        if admin_of_list is not None:

            for admin_of in admin_of_list:

                if community_name == admin_of:

                    return "alreadyAdmin"

        cur.execute(
            "UPDATE communities SET admins = array_append(admins, %s) WHERE name = %s",
            [username, community_name],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET admin_of = array_append(admin_of, %s) WHERE username = (%s)",
            [community_name, username],
        )

        conn.commit()

    elif type_of_privilege == "moderator":

        cur.execute(
            "SELECT username FROM user_information WHERE username = %s", [username]
        )

        if cur.fetchone() is None:

            return "noProfileWithThisName"

        cur.execute("SELECT admins FROM communities WHERE name = %s", [community_name])

        admins = cur.fetchone()[0]

        for admin in admins:

            if username == admin:

                return "alreadyAdmin"

        cur.execute(
            "SELECT moderator_of FROM user_information WHERE username = %s", [username]
        )

        moderator_of = cur.fetchone()[0]

        if moderator_of is not None:

            for moderator in moderator_of:

                if moderator == community_name:

                    return "alreadyModerator"

        cur.execute(
            "UPDATE communities SET moderators = array_append(moderators, %s) WHERE name = %s",
            [username, community_name],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET moderator_of = array_append(moderator_of, %s) WHERE username = (%s)",
            [community_name, username],
        )

        conn.commit()

    return "Sended!"


@app.route("/remove-admin-or-moderator", methods=["POST"])
@cross_origin()
def remove_admin_or_moderator():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    community_name = JSON_received["communityName"]

    cur.execute(
        "UPDATE communities SET moderators = array_remove(moderators, %s) WHERE name = %s",
        [username, community_name],
    )

    conn.commit()

    cur.execute(
        "UPDATE communities SET admins = array_remove(admins, %s) WHERE name = %s",
        [username, community_name],
    )

    conn.commit()

    cur.execute(
        "UPDATE user_information SET moderator_of = array_remove(moderator_of, %s) WHERE username = %s",
        [community_name, username],
    )

    conn.commit()

    cur.execute(
        "UPDATE user_information SET admin_of = array_remove(admin_of, %s) WHERE username = %s",
        [community_name, username],
    )

    conn.commit()

    return "Sended!"


@app.route("/change-privileges-to-moderator-or-admin", methods=["POST"])
@cross_origin()
def change_privileges_to_moderator_or_admin():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    type_of_privilege = JSON_received["typeOfPrivilege"]

    community_name = JSON_received["communityName"]

    if type_of_privilege == "moderator":

        cur.execute(
            "SELECT moderators FROM communities WHERE name = %s", [community_name]
        )

        moderators = cur.fetchone()[0]

        cur.execute("SELECT admins FROM communities WHERE name = %s", [community_name])

        admins = cur.fetchone()[0]

        index_of_indifference = 0

        if username in moderators:

            return "alreadyModerator"

        for admin in admins:

            if admin == username:

                index_of_indifference -= 1

        for moderator in moderators:

            if moderator != username:

                index_of_indifference += 1

            if moderator == username:

                index_of_indifference -= 1

        if index_of_indifference > len(moderators) - 1:

            return "userIsNotCommunityMember"

        cur.execute(
            "UPDATE communities SET admins = array_remove(admins, %s) WHERE name = %s",
            [username, community_name],
        )

        conn.commit()

        cur.execute(
            "UPDATE communities SET moderators = array_append(moderators, %s) WHERE name = %s",
            [username, community_name],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET moderator_of = array_append(moderator_of, %s) WHERE username = %s",
            [community_name, username],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET admin_of = array_remove(admin_of, %s) WHERE username = %s",
            [community_name, username],
        )

        conn.commit()

    elif type_of_privilege == "admin":

        cur.execute("SELECT admins FROM communities WHERE name = %s", [community_name])

        admins = cur.fetchone()[0]

        cur.execute(
            "SELECT moderators FROM communities WHERE name = %s", [community_name]
        )

        moderators = cur.fetchone()[0]

        index_of_indifference = 0

        if username in admins:

            return "alreadyAdmin"

        for moderator in moderators:

            if moderator == username:

                index_of_indifference -= 1

        for admin in admins:

            if admin != username:

                index_of_indifference += 1

            if admin == username:

                index_of_indifference -= 1

        if index_of_indifference > len(admins) - 1:

            return "userIsNotCommunityMember"

        cur.execute(
            "UPDATE communities SET moderators = array_remove(moderators, %s) WHERE name = %s",
            [username, community_name],
        )

        conn.commit()

        cur.execute(
            "UPDATE communities SET admins = array_append(admins, %s) WHERE name = %s",
            [username, community_name],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET moderator_of = array_remove(moderator_of, %s) WHERE username = %s",
            [community_name, username],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET admin_of = array_append(admin_of, %s) WHERE username = %s",
            [community_name, username],
        )

        conn.commit()

    return "Sended!"


@app.route("/perform-moderator-actions-with-user", methods=["POST"])
@cross_origin()
def check_if_user_is_moderator():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    email = JSON_received["email"]

    password = JSON_received["password"]

    community_name = JSON_received["communityName"]

    type_of_action = JSON_received["type"]

    id = JSON_received["id"]

    community_name = JSON_received["communityName"]

    is_user_moderator = False

    cur.execute(
        "SELECT admin_of FROM user_information WHERE email = %s AND password = %s",
        [email, password],
    )

    checking_if_admin_in = cur.fetchone()

    if checking_if_admin_in[0] != None:

        for admin in checking_if_admin_in[0]:

            if admin == community_name:

                is_user_moderator = True

    cur.execute(
        "SELECT moderator_of FROM user_information WHERE email = %s AND password = %s",
        [email, password],
    )

    checking_if_moderator_in = cur.fetchone()

    if checking_if_moderator_in[0] is not None:

        for moderator in checking_if_moderator_in[0]:

            if moderator == community_name:

                is_user_moderator = True

    cur.execute("SELECT admin_of FROM user_information WHERE username = %s", [username])

    admin_in = cur.fetchone()

    if admin_in[0] != None:

        for admin in admin_in[0]:

            if admin == community_name:

                return "youCan'tBanAModerator"

    cur.execute(
        "SELECT moderator_of FROM user_information WHERE username = %s", [username]
    )

    moderator_in = cur.fetchone()

    if moderator_in[0] is not None:

        for moderator in moderator_in[0]:

            if moderator == community_name:

                return "youCan'tBanAModerator"

    if is_user_moderator:

        if type_of_action == "deletePost":

            cur.execute("DELETE FROM post_information WHERE id = %s", [id])

            conn.commit()

        elif type_of_action == "banUser":

            cur.execute(
                "UPDATE user_information SET banned_from = array_append(banned_from, %s) WHERE username = %s",
                [community_name, username],
            )

            conn.commit()

            cur.execute(
                "UPDATE user_information SET following_communities = array_remove(following_communities, %s) WHERE username = %s",
                [community_name, username],
            )

            conn.commit()

            cur.execute("UPDATE communities SET members = members - 1")

            conn.commit()

    return "Sended!"


@app.route("/show-communties-to-users", methods=["GET"])
@cross_origin()
def show_communities_to_users():

    JSON_received = request.args.to_dict()

    searched_info = JSON_received["searchedInfo"]

    cur.execute(
        "SELECT name FROM communities WHERE name LIKE %s",
        ["%" + searched_info + "%"],
    )

    communities = cur.fetchall()

    return communities


@app.route("/get-community-info", methods=["GET"])
@cross_origin()
def get_community_info():

    JSON_received = request.args.to_dict()

    community_name = JSON_received["communityName[]"]

    cur.execute("SELECT * FROM communities WHERE name = %s", [community_name])

    community_info = list(cur.fetchone())

    return community_info


@app.route("/subscribe-to-community", methods=["POST"])
@cross_origin()
def subscribe_to_community():

    JSON_received = request.get_json()["params"]

    community_name = JSON_received["communityName"]

    username = JSON_received["username"]

    cur.execute(
        "SELECT following_communities FROM user_information WHERE username = %s",
        [username],
    )

    cur.execute("SELECT members FROM communities WHERE name = (%s)", [community_name])

    add_one_follower = cur.fetchone()[0] + 1

    cur.execute(
        "UPDATE communities SET members = %s WHERE name = (%s)",
        [add_one_follower, community_name],
    )

    conn.commit()

    cur.execute(
        "UPDATE user_information SET following_communities = array_append(following_communities, %s) WHERE username = %s",
        [community_name, username],
    )

    conn.commit()

    return "Sended!"


@app.route("/check-subscription-to-community", methods=["GET"])
@cross_origin()
def check_subscription_to_community():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    community_name = JSON_received["communityName"]

    cur.execute(
        "SELECT following_communities FROM user_information WHERE username = %s",
        [username],
    )

    following_communities = cur.fetchone()[0]

    if following_communities is not None:

        for community in following_communities:

            if community == community_name:

                return "alreadySubscribed"

    return "notSubscribed"


@app.route("/check-if-user-is-banned-from-community", methods=["POST"])
@cross_origin()
def check_if_user_is_banned_from_community():

    JSON_received = request.get_json()["params"]

    username = JSON_received["username"]

    community_name = JSON_received["communityName"]

    cur.execute(
        "SELECT banned_from FROM user_information WHERE username = %s", [username]
    )

    banned_from = cur.fetchone()

    if banned_from[0] is not None:

        for banned in banned_from[0]:

            if banned == community_name:

                return "banned"

    return "notBanned"


@app.route("/send-community-user-is-following", methods=["GET"])
@cross_origin()
def send_community_user_is_following():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    cur.execute(
        "SELECT following_communities FROM user_information WHERE username = %s",
        [username],
    )

    following_communities = cur.fetchone()[0]

    if following_communities is None:

        return "noCommunitiesFollowed"

    else:

        return following_communities


@app.route("/send-to-user-publications-of-specific-community", methods=["GET"])
@cross_origin()
def send_to_user_publications_of_specific_community():

    JSON_received = request.args.to_dict()

    community_name = JSON_received["communityName"]

    cur.execute(
        "SELECT * FROM post_information WHERE community = %s LIMIT 3", [community_name]
    )

    posts = cur.fetchall()

    return posts


@app.route("/create-chat", methods=["POST"])
@cross_origin()
def create_chat():

    JSON_received = request.get_json()["params"]

    usernames = JSON_received["usernames"]

    name_of_chat = JSON_received["nameOfChat"]

    id_of_chat = str(uuid.uuid4())

    users_of_chat = []

    usernames_admin = []

    for username in usernames:

        users_of_chat.append(username[0])

        cur.execute(
            "UPDATE user_information SET chats_id = array_append(chats_id, %s) WHERE username = %s",
            [id_of_chat, username[0]],
        )

        conn.commit()

        if username[1] == "admin":

            cur.execute(
                "UPDATE user_information SET admin_of_chats = array_append(admin_of_chats, %s) WHERE username = %s",
                [id_of_chat, username[0]],
            )

            conn.commit()

            usernames_admin.append(username[0])

    cur.execute(
        "INSERT INTO chat (id_of_chat, name_of_chat, users, admins_usernames) VALUES (%s, %s, %s, %s)",
        [id_of_chat, name_of_chat, users_of_chat, usernames_admin],
    )

    conn.commit()

    return "Sended!"


@app.route("/check-if-user-exists", methods=["GET"])
@cross_origin()
def check_if_user_exists():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    cur.execute(
        "SELECT EXISTS(SELECT 1 FROM user_information WHERE username = %s)", [username]
    )

    user_exists = cur.fetchone()

    return str(user_exists[0])


@app.route("/show-chats-to-user", methods=["GET"])
@cross_origin()
def show_chats_to_user():

    JSON_received = request.args.to_dict()

    username = JSON_received["username"]

    # Password of the author
    password = JSON_received["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [username, password],
    )

    is_user_valid = cur.fetchone()

    if is_user_valid is not None and is_user_valid[0] == username:

        cur.execute(
            "SELECT chats_id FROM user_information WHERE username = %s", [username]
        )

        ids = cur.fetchone()

        chats_of_user = []

        print(ids)

        if ids[0] is not None:

            for id in ids[0]:

                cur.execute("SELECT name_of_chat FROM chat WHERE id_of_chat = %s", [id])

                chats_of_user.append(cur.fetchone())

    return chats_of_user


@app.route("/show-messages-to-user", methods=["GET"])
@cross_origin()
def show_messages_to_user():

    JSON_received = request.args.to_dict()

    chat_name = JSON_received["chatName"]

    cur.execute("SELECT * FROM chat WHERE name_of_chat = %s", [chat_name])

    messages = cur.fetchone()

    messages_to_array = []

    for message_info in messages:

        messages_to_array.append(message_info)

    return messages_to_array


@app.route("/ban-user-from-chat-page", methods=["POST"])
@cross_origin()
def ban_user_from_chat_page():

    JSON_received = request.get_json()["params"]

    username_of_banned_user = JSON_received["usernameOfBannedUser"]

    username_of_admin = JSON_received["adminUsername"]

    admin_password = JSON_received["adminPassword"]

    id_of_chat = JSON_received["idOfChat"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s AND %s = ANY(admin_of_chats)",
        [username_of_admin, admin_password, id_of_chat],
    )

    is_user_valid = cur.fetchone()

    print(is_user_valid)

    if is_user_valid is not None and is_user_valid[0] == username_of_admin:

        cur.execute(
            "UPDATE chat SET users = array_remove(users, %s) WHERE id_of_chat = %s",
            [username_of_banned_user, id_of_chat],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET chats_id = array_remove(chats_id, %s) WHERE username = %s",
            [id_of_chat, username_of_banned_user],
        )

    return "Sended!"


@app.route("/change-privileges-of-user-in-chat", methods=["POST"])
@cross_origin()
def change_privileges_of_user_in_chat():

    JSON_received = request.get_json()["params"]

    username_of_new_admin = JSON_received["usernameOfNewAdmin"]

    username_of_admin = JSON_received["adminUsername"]

    admin_password = JSON_received["adminPassword"]

    id_of_chat = JSON_received["idOfChat"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s AND %s = ANY(admin_of_chats)",
        [username_of_admin, admin_password, id_of_chat],
    )

    is_user_valid = cur.fetchone()

    if is_user_valid is not None and is_user_valid[0] == username_of_admin:

        cur.execute(
            "UPDATE chat SET admins_usernames = array_append(admins_usernames, %s) WHERE id_of_chat = %s",
            [username_of_new_admin, id_of_chat],
        )

        conn.commit()

        cur.execute(
            "UPDATE user_information SET admin_of_chats = array_append(admin_of_chats, %s) WHERE username = %s",
            [id_of_chat, username_of_new_admin],
        )

        conn.commit()

    return "Sended!"


@socketio.on("joinRoom")
def join_room_def(room_id):

    join_room(room_id)


@socketio.on("sendMessage")
def get_message(data):

    author = data["username"]

    password = data["password"]

    cur.execute(
        "SELECT username FROM user_information WHERE username = %s AND password = %s",
        [author, password],
    )

    is_user_valid = cur.fetchone()

    print(is_user_valid)

    if is_user_valid is not None and is_user_valid[0] == author:

        # Stringified message with username and text like:  John: Hello World!
        data_stringified = json.dumps([data["username"], data["text"]])

        data_to_process = {
            "stringified_message": data_stringified,
            "author": data["username"],
            "image_and_videos_path": [],
        }

        # Images of post
        images = data["imagesBase64"]

        # Videos of post
        videos = data["videosBase64"]

        # All images and videos will be stored in images_and_videos folder inside of backend folder

        # If there are any images in images variables do this
        if len(images) > 0:

            # Iterate every images
            for image in images:

                # Put the id of image as name
                id_of_image = str(uuid.uuid4())

                data_to_process["image_and_videos_path"].append(
                    ["image", "images_and_videos/" + id_of_image + ".png"]
                )

                # Make all base64 to image format and store it in images_and_videos folder
                with open("images_and_videos/" + id_of_image + ".png", "wb") as f:
                    f.write(base64.b64decode(image.split(",")[1]))

        if len(videos) > 0:

            for video in videos:

                # Id of each video
                id_of_video = str(uuid.uuid4())

                data_to_process["image_and_videos_path"].append(
                    ["video", "images_and_videos/" + id_of_video + ".mp4"]
                )

                # Make all base64 to video format and store it in images_and_videos folder
                with open("images_and_videos/" + id_of_video + ".mp4", "wb") as f:
                    f.write(base64.b64decode(video.split(",")[1]))

        cur.execute(
            "UPDATE chat SET messages = array_append(messages, %s) WHERE id_of_chat = %s",
            [json.dumps(data_to_process), data["idOfChat"]],
        )

        conn.commit()

        emit(
            "receiveMessage",
            json.dumps(data_to_process),
            room=data["idOfChat"],
        )


@app.route("/sort-publications-by", methods=["GET"])
@cross_origin()
def sort_publications_by():

    JSON_received = request.args.to_dict()

    type_of_sort = JSON_received["typeOfSort"]

    community = JSON_received["community"]

    if community == "noCommunity":

        if type_of_sort == "Newest":

            cur.execute(
                "SELECT * FROM post_information ORDER BY date_of_post DESC LIMIT 5"
            )

            return cur.fetchall()

        if type_of_sort == "Oldest":

            cur.execute(
                "SELECT * FROM post_information ORDER BY date_of_post ASC LIMIT 5"
            )

            return cur.fetchall()

        if type_of_sort == "Popular":

            cur.execute("SELECT * FROM post_information ORDER BY likes DESC LIMIT 5")

            return cur.fetchall()

        if type_of_sort == "Newest and popular":

            cur.execute(
                "SELECT * FROM post_information ORDER BY likes, date_of_post DESC LIMIT 5"
            )

            return cur.fetchall()
    else:

        if type_of_sort == "Newest":

            cur.execute(
                "SELECT * FROM post_information WHERE community = %s ORDER BY date_of_post DESC LIMIT 5",
                [community],
            )

            return cur.fetchall()

        if type_of_sort == "Oldest":

            cur.execute(
                "SELECT * FROM post_information WHERE community = %s ORDER BY date_of_post ASC LIMIT 5",
                [community],
            )

            return cur.fetchall()

        if type_of_sort == "Popular":

            cur.execute(
                "SELECT * FROM post_information WHERE community = %s ORDER BY likes DESC LIMIT 5",
                [community],
            )

            return cur.fetchall()

        if type_of_sort == "Newest and popular":

            cur.execute(
                "SELECT * FROM post_information WHERE community = %s ORDER BY likes, date_of_post DESC LIMIT 5",
                [community],
            )

            return cur.fetchall()

    return "Sended!"


if __name__ == "__main__":
    app.run(debug=True)
    socketio.run(app)
