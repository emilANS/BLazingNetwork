<h1>About this project:</h1>

A social network with features like chatpages, group chatpages, individual chatpages, comments, replies, likes and dislikes systems, it haves the hability to upload your posts with images or videos and you can save posts and comment on them, it haves a community system where posts can be created there so people can search in the search bar for the communities they are in and post and see posts there, you can subscribe to communities and see more posts with the recommendation system, the recommendaation system is a mathematical metric formula called cosine similarity that takes all likes from users and see what users have the most similar interests and recommend these posts from other users to the user, it have a administrator systems in chat and community pages like ban users, make users admins or moderators, remove the rank of admin from communities or chat pages, you can change your profile settings like image, username, password, email, it have a registration and login system, it is connected to a postgresql backend where all posts likes users are stored, it haves a profile page system where you can see posts users have made and replies comments, likes, dislikes etc, all is personalized and adapted to a vast majority of phones, tablets, screens

<h1>Technologies used for creating this website</h1>
React + Vite
<br>
Nodejs
<br>
Python
<br>
Postgresql

<h1>How to run the webpage</h1>

<h3>Requirements</h3>
Python 3 <-- this is the version i used during development of this website
  <br>
NodeJs 22 <-- i used also this version during development
  <br>
Postgresql

<h2>Step 1</h2>
Open the main root folder with your terminal and type npm install wait until it finishes

<h2>Step 2</h2>
Then in your terminal type npm run dev

<h2>Step 3</h2>
With your terminal go to src/backend/.venv/Scripts and type activate.bat

<h2>Step 4</h2>
With your terminal go to src/backend/requirements and type in your terminal <br>
pip install -r requirements.txt
<br>
wait until it finishes

<h2>Step 5</h2>
in src/backend go to credentials_sql.py and put your user in postgresql and your password in your postgresql

<h2>Step 6</h2>
with your terminal with .venv activated go to src/backend and type create_database.py then press enter

<h2>Final step</h2>
with your terminal with .venv activated in src/backend type: py main.py

visite the link http://localhost:5173/ and see if everything works well try registering and if it throws you an error is because you did something incorrect during the initialization
so try it again if it happens.. if you didn't have any error Congratulations! you have initialized the social network BlazingNetwork enjoy it!


<h1>How to activate the recommendation system</h1>
first of all you have ta least have like 20 active members but you can try it with fewer persons as well but the majority of them must have liked 5 or a little less a post from a community to work well what you have to do is with .venv activated terminal go to src/backend/recommendation_system and type py recommendation_system.py and it should generate a txt file that have the results of the cosine similarity applied to the interests of the users if all worked witouth errors the recommendation system is applied so Congratulations!!, the recommendation system will start to show posts of the like of the user that is seeing the social network
