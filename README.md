# 0. Installation

```bash
# Install the Serverless CLI
npm install serverless (maybe sudo is required)

# Install dynamodb local
sls dynamodb install

# Edit (if needed) your environment variables (and update the JWT secret)
(optional) env.prod.yml
```

## Required softwares:

- NodeJS (version 10 or newer)
- Java runtime (for dynamoDB local server)

## Recommended software

- Visual Studio Code (IDE for develpment)
- Postman
- Google Chrome

---

# 1. Usage

### 1.1 Development

You can use Serverless Offline while you develop, which starts a local DynamoDB instance (data is reset on each start)

```bash
npm start

# OR to use env.staging.yml environment variables:
# npm start --STAGE staging
```

Expected Result: (BE SURE that DynamoDB local is installed and running)

# 2. Production

__1. Setup your AWS credentials__

_Create a new AWS IAM user and assign the `AdministratorAccess` policy to the new user (later, it's best to reduce the permissions this IAM User has for security reasons)._

```bash
serverless config credentials --provider aws --key <YOUR_AWS_KEY> --secret <YOUR_AWS_SECRET>
```

__2. Then deploy to AWS__

```bash
sls deploy

# OR to use env.dev.yml environment variables:
# sls deploy --STAGE dev
```

# 3. Debugging

## 5.1. DynamoDB Local Shell / Web tool

You can use your browser to query dynamoDB local database. After running npm star (sls offline start --migrate), use this URL to check database information 

http://localhost:8000/shell/



---

