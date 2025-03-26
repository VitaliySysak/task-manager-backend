1. Add your environment variables. - Create .env file
2. Install dependencies - npm i
3. Start the development server - npm run dev to start

Documentation
task-manager
﻿

GET
get-all-users
http://localhost:5000/users/all
﻿

Authorization
Bearer Token
Token
<token>
POST
register
http://localhost:5000/users/register
﻿

Authorization
Bearer Token
Body
raw (json)
json
{
    "fullName": "user1",
    "email": "user1@qwe.qwe",
    "password": "user1user1"
}
POST
register-admin
http://localhost:5000/users/admin/register
﻿

Body
raw (json)
json
{
    "fullName": "admin1",
    "email": "admin2@gmail.com",
    "password": "c1720785-ea6e-4a58-9d55-2df43c36f3a4"
}
POST
login
http://localhost:5000/users/login
﻿

Body
raw (json)
json
{
    "email": "admin1@gmail.com",
    "password": "c1720785-ea6e-4a58-9d55-2df43c36f3a4"
}
GET
get-all-users-tasks
http://localhost:5000/tasks/all
﻿

Authorization
Bearer Token
Token
<token>
POST
create task
http://localhost:5000/tasks
﻿

Authorization
Bearer Token
Token
<token>
Body
raw (json)
json
{
    "title": "task10"
}
GET
get-tasks
http://localhost:5000/tasks?description=1
﻿

Authorization
Bearer Token
Token
<token>
Query Params
description
1
GET
get-task-by-id
http://localhost:5000/tasks/4
﻿

Authorization
Bearer Token
Token
<token>
PUT
update-task
http://localhost:5000/tasks/1
﻿

Authorization
Bearer Token
Token
<token>
Body
raw (json)
json
{
    "title": "homework",
    "description": "test",
    "status": "DONE"
}
DELETE
delete-task
http://localhost:5000/tasks/15
﻿

Authorization
Bearer Token