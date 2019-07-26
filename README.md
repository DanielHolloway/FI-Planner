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

To run Flask in Ubuntu: python3 run.py


To re-enter the virtual Python environment: .\env\Scripts\activate
.\static> npm run watch (or npm run build)
In root, do: py run.py
http://127.0.0.1:5000/#/journal

Updating pip requirements:
pip freeze > requirements.txt

To use requirements.txt:
pip install -r requirements.txt

Setting up a sqlite db for the first time after making db Model:
>>> from bookmanager import db
>>> db.create_all()
>>> exit()

.env file should be in top level of file structure

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

Using Redux for user sessions (JWT instead of cookies): https://jasonwatmore.com/post/2017/12/07/react-redux-jwt-authentication-tutorial-example

Flask JWT tutorial: https://medium.com/@riken.mehta/full-stack-tutorial-3-flask-jwt-e759d2ee5727

To-do list:
    ### DONE ###
    Host on github - done on 7/15
    API authentication - done on 7/21
    User authentication - started on 7/10, done on 7/21
    Journal page
        Got the Entry table updating automatically on 7/6
    Re-structure database - done on 7/6
        Have these 7 tables: Comment, Category, User, Login, Membership, Account, Entry
        Flask Migrate not working on sqlite3 tho :(
    Re-structure API's - done on 7/7
        Added for Entry and User on 7/6
        Comment, Category, User, Login, Membership, Account, Entry done on 7/7

    ### BUGS ###
    Old JWT's cause "UNPROCESSABLE ENTITY" when hitting "GET api/Entry". Need to fix old JWT's: use refresher token and refresh the old ones

    ### FEATURES ###
    Mobile responsiveness
    Figure out checklist for deployment:
        0. Reference: https://martinfowler.com/articles/web-security-basics.html
        1. User/API auth and protection - JWT done on 7/21, need to cascade
            How to authenticate user logins before successful password check?
        2. HTTPS - implementation started, but slow on localhost
            use gunicorn and nginx
            get certificate from CA
            config: https://mozilla.github.io/server-side-tls/ssl-config-generator/
            check your config periodically: https://www.ssllabs.com/ssltest/
            re-direct HTTP to HTTPS
            send HSTS headers to users' browsers (make sure that HTTPS is set up first on all pages)
        3. Input validation
            React
            Flask?
        4. Output encoding (for HTML outputs)
            React
        5. Parameter binding - done on 7/7
            Flask - handled by SQLAlchemy functions
        6. Hash and salt passwords
            12-100 alpha-numeric and symbolic
            tell users good habits to use when making password
        7. User authentication
            Prevent brute force attacks - maybe use a captcha after two failed and lock the account temporarily after 2 more?
        8. Session Management
            Look into safe session management for JWT's (article only talked about cookies)
        9. Authorize Actions
            Based on a user's role, map the correct permissions "upstream". Called Role Based Access Control (RBAC)
            To ensure consistent user auth, set Cache-Control header to "private, no-cache, no-store"
        DB encryption?
        What else? Check with OWASP and DWVA
    Hosted on AWS
    Metrics page