# File Sharing API Server


## Docker Installation
This application needs to have postgresql database and redis server. You need to have prepare those enviroment for this. Or you can use the run the following docker-compose commands to prepare the enviroment.
Clone the repo:

```bash
docker-compose build
```

```bash
docker-compose up -d
```
## Manual Installation

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```


## Features

- **ORM**: [Sequelize](https://sequelize.org/)  orm for object data modeling
- **Migration and Seed**: DB migration and Seed using [Sequelize-CLI](https://github.com/sequelize/cli) 
- **Authentication and authorization**: using [passport](http://www.passportjs.org)
- **Error handling**: centralized error handling
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: using [winston](https://github.com/winstonjs/winston) 
- **Testing**: unittests using [Mocha](https://mochajs.org/)
- **Caching**: Caching using [Redis](https://redis.io/)
- **Bidirectional Communication**: using [Scoket](https://socket.io/)
- **Job scheduler**: with [Node-cron](https://www.npmjs.com/package/node-cron)
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Docker support**
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
#Server environment
NODE_ENV=development
#Port number
PORT=5000

#Db configuration
DB_HOST=db-host
DB_USER=db-user
DB_PASS=db-pass
DB_NAME=db-name


# JWT secret key
JWT_SECRET=your-jwt-secret-key
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=5
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30

#Log config
LOG_FOLDER=logs/
LOG_FILE=%DATE%-app-log.log
LOG_LEVEL=error

#Redis
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_USE_PASSWORD=no
REDIS_PASSWORD=your-password

FOLDER=folder-name
PROVIDER=local

#S3 config
S3_BUCKET=s3-bucket-name
AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY
S3_REGION="s3-region"

UPLOAD_LIMIT=10
DOWNLOAD_LIMIT=10

MAX_INACTIVE_PERIOD_IN_DAYS=10

```

## Project Structure

```
specs\
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--dao\            # Data Access Object for models
 |--db\             # Migrations and Seed files
 |--models\         # Sequelize models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--helper\         # Helper classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--cronJobs.js     # Job Scheduler
 |--index.js        # App entry point
```

Here is the API [Documentation](https://documenter.getpostman.com/view/1320302/2s93Y2TMiP)

## License

[MIT](LICENSE)
