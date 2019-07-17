Always use "npm install" in the same directory as package.json, which is in templates/static/ for this project

When starting on a fresh computer, go to static directory and just run "npm install". It'll get all the npm packages used by "npm run watch"

How to set up the first virtual env:
py -m pip install --upgrade pip
if you haven't done this once yet: py -m pip install --user virtualenv
py -m venv env
.\env\Scripts\activate
to leave: deactivate

venv in Ubuntu:
sudo apt-get install python3-pip
sudo pip3 install virtualenv 
virtualenv venv 
source venv/bin/activate
deactivate

To run Flask in Ubuntu: use python3 run.py


To re-enter the virtual Python environment: .\env\Scripts\activate
.\static> npm run watch (or npm run build)
In root, do: py run.py
http://127.0.0.1:5000/#/journal

Setting up a sqlite db for the first time after making db Model:
>>> from bookmanager import db
>>> db.create_all()
>>> exit()

Operating on a sqlite db from PowerShell
    PS C:\Users\Dino.Rawr\Desktop\DH\Coding\FirstProject> .\env\Scripts\activate
    (env) PS C:\Users\Dino.Rawr\Desktop\DH\Coding\FirstProject> py
    >>> import sqlite3
    >>> con = sqlite3.connect('comments.db')
    >>> cursor = con.cursor()
    >>> cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    <sqlite3.Cursor object at 0x000001B4D335C960>
    >>> print(cursor.fetchall())
    [('categories',), ('comments',), ('alembic_version',), ('users',), ('logins',), ('accounts',), ('memberships',), ('entries',)]
    >>> cursor.close()
    >>> con.close()
    >>> [ctrl+z and enter]

Whenever the database schema is changed, do the following from root: (use 'python migrate.py db init' to get it started)
python migrate.py db migrate
python migrate.py db upgrade

Check these web designs for ideas: https://colorlib.com/wp/bootstrap-website-templates/

Load new pages more smoothly: https://scotch.io/tutorials/lazy-loading-routes-in-react

Found favicon here: https://www.iconsdb.com/icon-sets/
And generated favicon file here: https://realfavicongenerator.net/

User database model: https://www.donedone.com/building-the-optimal-user-database-model-for-your-application/

Fonts: https://fonts.google.com/?selection.family=Oxygen|Ubuntu

Icons: https://octicons.github.com/ and https://github.com/primer/octicons/tree/master/lib/octicons_react

Cookies: https://flask-login.readthedocs.io/en/latest/ 
    and https://blog.miguelgrinberg.com/post/cookie-security-for-flask-applications
    and https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-v-user-logins
    and the one right below here

Full auth tutorial with flask-login: https://scotch.io/tutorials/authentication-and-authorization-with-flask-login

HTTPS: https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https
    C:\Program Files\Git\usr\bin\openssl.exe req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem


To-do list:
    Mobile responsiveness
    Host on github
    API authentication
    User authentication
    Hosted on AWS
    Journal page
        Got the Entry table updating automatically on 7/6
    Metrics page
    Re-structure database - done on 7/6
        Have these 7 tables: Comment, Category, User, Login, Membership, Account, Entry
        Flask Migrate not working on sqlite3 tho :(
    Re-structure API's - done on 7/7
        Added for Entry and User on 7/6
        Comment, Category, User, Login, Membership, Account, Entry done on 7/7