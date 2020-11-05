TK TO DO APP

1. Installing the server
Please delete the comment in **user.json** file before launching the app.
Install the server by typing **npm install** in the root folder.

2. Starting the server
Start the server by typing **npm start** in the root folder.

3. Testing the server
Test the server by typing **npm test** in the root folder.

4. Installing the frontend (react app)
Install the react app by typing **cd frontend** to go into it's folder
and then typing **npm install** to install the app's dependencies.

5. Starting the frontend (react app)
In the **frontend** folder, type **npm start** to launch the app and 
view it on **http://localhost:3000/**.

6. Testing the frontend (react app)
In the **frontend** folder, type **npm test** to test the react app. It will do
a unit test and a snapshot test.

7. More info
I have secured this app using Helmet and have put all the sensitive information and 
API keys of the app in an **.env** file. I have not committed this file for security
purposes. The application is deployed in Heroku. I chose Heroku as it is the place I feel
most comfortable with, thanks to this course. 

The deployed link is **https://tk-to-do-app-server.herokuapp.com/** and it's GitHub code is 
**-----------**. The backend and the frontend have been deployed together. It is
easier to manage and improve an app in one repo than in two repos. The wireframes
and the README file of the previous tasks are in the **design** folder, for reference.
Please delete the comment in **user.json** before launching the app. 

In a previous task the mentor said I should use localStorage instead of a json file. I used the json file in this
task because it is directly controlled by the server instead of the react app. I wanted the
server to manage all the information that will be given to the react app. I only wanted the
react app to receive and use data instead of managing it. I could not find an alternative that
was as effecient and easy to use as the json file, that is why I used it here.