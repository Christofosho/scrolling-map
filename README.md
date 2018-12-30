# scrolling-map
It's a map.

Don't need to install? [Build](#building) instead.

## Installing
### Step 1: Install Python 3 and VirtualEnv
Download and install the latest version from:
https://www.python.org/downloads/

After installing,
Windows: Open cmd.exe
Linux: Open terminal

Now type:
```
pip install virtualenv
```

From outside your project folder, type**:
```
virtualenv YOUR_PROJECT_FOLDER
```
Where `YOUR_PROJECT_FOLDER` is your project.

** Note: if pip does not work, you may need to restart your terminal or cmd.exe

### Step 2: Installing Flask and Flask-SocketIO
With the same screen open as before**,

Terminal:
```
cd YOUR_PROJECT_FOLDER
source scripts/activate
pip install flask flask-socketio
```

cmd.exe:
```
cd YOUR_PROJECT_FOLDER
.\scripts\activate
pip install flask flask-socketio
```

*** Note: if pip does not work, you may need to restart your terminal or cmd.exe

### Step 3: Install npm
Download and install the latest version from:
https://nodejs.org/en/

### Step 4: Initialize npm
Navigate to the project directory, and then type**:
```
npm init
npm install --savedev webpack webpack-cli
```

** Note: You may need to restart terminal or cmd.exe in order to have access to this command.


## Building
Now that the project is set up (I hope..) you can build the changes you make.
When you make changes to the js/* files, the easiest way to build those changes
is to type `npx webpack`.
