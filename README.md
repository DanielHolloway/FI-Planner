Always use "npm install --save" in the same directory as package.json, which is in templates/static/ for this project. The "--save" adds it to the package.json for future local repos.

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

Running Gunicorn from terminal: gunicorn --bind 127.0.0.1:5000 -w 4 "templates:create_app('configurations.ProductionConfig')"

Use this to list nginx sites: grep server_name /etc/nginx/sites-enabled/* -RiI

After setting up Gunicorn and Nginx configs according to tutorial, my website will always be running at 127.0.0.1
Use this to see Flask logs: sudo journalctl -u fi-planner
And for Nginx logs: sudo journalctl -u nginx and sudo less /var/log/nginx/error.log and sudo less /var/log/nginx/access.log
I got stuck because I didn't know to add "--log-level debug" to my gunicorn binding command and flush=True to my py prints
I ended up needing to add "EnvironmentFile" to my fi-planner.service gunicorn file so that it could get the secrets
Also, I had to update my method for pulling user IP's to get it from the Nginx request header

https://lightsail.aws.amazon.com
Logging into Amazon LightSail:
chmod 400 <pem file>
ssh-add <pem file>
ssh <user>@<address>
once you're in, use "sudo systemctl start nginx" to start the server back up

To re-enter the virtual Python environment: .\env\Scripts\activate
.\static> npm run watch (or npm run build)
In root, do: py run.py
http://127.0.0.1:5000/#/journal

Installing and updating requirements with pip:
pip install <package> && pip freeze > requirements.txt

Updating pip requirements:
pip freeze > requirements.txt

To use requirements.txt:
pip install -r requirements.txt

Consider using "pipenv" instead of "pip install" in future projects

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
    Hosted on AWS 
        - will probably need Ubuntu 18.04 or some other Linux for Memcached (blacklist) functionality
        Done with Amazon LightSail on 8/5 and got HTTPS cert working
    React input validation - finished home and journal input validation on 7/26
    Output encoding (for HTML outputs) - done on 7/26
    Locked bad login attempts on 7/27
    Good password habits - done on 7/28
    Locked up all API's and finished initial redirects on 7/26
    12-100 alpha-numeric passwords - fixed on 8/3
    Cookie freshness check for sensitive endpoints on 8/3
    Implemented basic user roles on 8/3
    Activity logging for API's and blacklist on 8/7
    Listed and organized architecture components and took photo on 8/12
    SMS verification on 8/12
    Built redirecting from un-registered URL paths on 8/13
    SMS verification redirect and reissue are working along with error message on 8/13
    Added DDoS protection via nginx configs on 8/13 (copy to prod)
    Found that encrypting sqlite with python is exceedingly difficult, will revisit during MySQL migration 8/13
    Div content not filling body - only happens when Alert pops up - fixed on 8/14
    Mobile responsiveness - 8/14

    ### FEATURES ###
    Test security and leave deployed
    Change background images based on page and blur them
    Add API error messages to React forms
    Metrics page

    ### BUGS ###

    ### FUTURE RELEASES ###
    DB encryption


    ### GENERAL SECURITY CHECKLIST ###
    ### This whole list needs to be constantly reviewed as new features are added ###
        0. Reference: https://martinfowler.com/articles/web-security-basics.html
        1. User/API auth and protection - JWT done on 7/21, need to cascade
            How to authenticate user logins before successful password check?
            Locked up all API's and finished initial redirects on 7/26
        2. HTTPS - implementation started, but slow on localhost
            use gunicorn and nginx - https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-18-04
                Needed to specify factory in gunicorn start-up
                Need to run "sudo ufw enable" to get "sudo ufw status" to show "active"
                When using nano in Ubuntu, use Ctrl+O to save and Ctrl+X to exit the file
            get certificate from CA
            config: https://mozilla.github.io/server-side-tls/ssl-config-generator/
            check your config periodically: https://www.ssllabs.com/ssltest/
            re-direct HTTP to HTTPS
            send HSTS headers to users' browsers (make sure that HTTPS is set up first on all pages)
        3. Input validation
            React - finished home and journal input validation on 7/26
            Flask - need to do more validations on API's
        4. Output encoding (for HTML outputs) - done on 7/26
            React -
                Don't use dangerouslySetInnerHTML
                Don't allow user inputs to populate href fields or src fields or props (elements)
        5. Parameter binding - done on 7/7
            Flask - handled by SQLAlchemy functions
        6. Hash and salt passwords - done on 7/28
            12-100 alpha-numeric - fixed password pattern checking on 8/3
            tell users good habits to use when making password - done on 7/28
        7. User authentication - done on 7/27
            Prevent brute force attacks - maybe use a captcha after two failed and lock the account temporarily after 2 more?
            Locked bad login attempts on 7/27, maybe add captcha's or email challenges later
            Memcached - install on dev environments and deployment environment before running server
                Only works on Linux, run these commands
                    Restart memcached, change to start/stop as needed: sudo systemctl restart memcached
                    Check for "memcached" on correct IP: sudo netstat -plunt
                    Check for specific memcached stats: memcstat --servers="<correct IP>"
            Did SMS verification on 8/12
        8. Session Management
            Look into safe session management for JWT's (article only talked about cookies)
            https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/JSON_Web_Token_Cheat_Sheet_for_Java.md
            ^ finished "explicit revocation by user"
            need to add refresh tokens, fresh vs non-fresh
            need to add hardened cookies (for token sidejacking): code example is https://flask-jwt-extended.readthedocs.io/en/latest/tokens_in_cookies.html
            First draft of session management done on 7/29
            remove refresh token upon logout? (using the blacklist?) - done on 8/3, didn't need blacklist
            started to implement freshness check for sensitive endpoints on 8/3
        9. Authorize Actions
            Based on a user's role, map the correct permissions "upstream". Called Role Based Access Control (RBAC)
            To ensure consistent user auth, set Cache-Control header to "private, no-cache, no-store"
            Reference: https://medium.com/bluecore-engineering/implementing-role-based-security-in-a-web-app-89b66d1410e4
                Flask-specific: https://www.reddit.com/r/flask/comments/2uovxs/af_manage_roles_in_rest_api/
            Strategy is Role Based Security: make parent resources to group child resources, make roles to contain permissions, and make user groups to contain individual users. Then grant roles to user groups to access different parent or child resources
                Membership.related_role_id meanings:
                    1 = admin
                    2 = user
                    3 = guest
            Restrict user's access to only their own info in API's unless admin - done on 8/3
        10. Activity logging
            By IP address, page, and actions
            Done for API's and blacklist on 8/7
        What else? Check with OWASP and DWVA


