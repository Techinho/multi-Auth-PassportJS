# Multi-Authentication System with Passport.js

A robust authentication system that implements multiple authentication strategies: JWT-based form login, Google OAuth, and GitHub OAuth using Passport.js.

![Authentication System](https://img.shields.io/badge/Authentication-Passport.js-green)
![OAuth](https://img.shields.io/badge/OAuth-Google%20%7C%20GitHub-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-yellow)
![ExpressJS](https://img.shields.io/badge/Framework-Express.js-lightgrey)

## 📋 Features

- **Multiple Authentication Methods**:
  - Traditional email/password authentication with JWT
  - Google OAuth 2.0 authentication
  - GitHub OAuth authentication
- **Secure User Management**:
  - Password encryption with bcrypt
  - JWT token-based authentication
  - Server-side session management
  - Strong password validation
- **User Experience**:
  - Seamless authentication flow
  - Professional UI design
  - Responsive layout for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB database
- Google OAuth credentials
- GitHub OAuth credentials

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/auth-system
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/Techinho/multi-Auth-PassportJS.git
   cd multi-Auth-PassportJS
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the application:

   ```
   node app.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
├── app.js                # Main application entry point
├── config/
│   └── passport-setup.js # Passport.js configuration
├── models/
│   └── user-model.js     # User schema and authentication methods
├── routes/
│   ├── auth-routes.js    # Authentication routes
│   └── profile-routes.js # Protected profile routes
└── views/
    ├── home.ejs         # Home page with auth options
    ├── login.ejs        # Login form page
    └── profile.ejs      # Protected profile page
```

## 🔐 Authentication Flow

### JWT Authentication

1. User registers with email/password
2. Password is hashed using bcrypt
3. On login, JWT token is generated and returned
4. Client stores token in localStorage
5. Token is sent in Authorization header for protected routes

### OAuth Authentication (Google/GitHub)

1. User clicks on "Login with Google/GitHub" button
2. User is redirected to Google/GitHub consent screen
3. After consent, user is redirected back with OAuth code
4. Server exchanges code for user profile information
5. User is created/retrieved in database
6. JWT token is generated and sent to client
7. Client is redirected to protected profile page

## 🛡️ Security Considerations

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens expire after 1 hour
- Session cookies are HTTP-only, secure in production, and use SameSite=Lax
- Strong password validation with validator.js
- OAuth scope limited to necessary information only
- Proper error handling to prevent information leakage

## 🧰 API Routes

### Authentication Routes

- `GET /auth/login`: Renders login page
- `POST /auth/login`: Handles form login, returns JWT token
- `GET /auth/register`: Renders registration page
- `POST /auth/register`: Handles user registration
- `GET /auth/logout`: Logs out the user
- `GET /auth/google`: Initiates Google OAuth flow
- `GET /auth/google/redirect`: Handles Google OAuth callback
- `GET /auth/github`: Initiates GitHub OAuth flow
- `GET /auth/github/redirect`: Handles GitHub OAuth callback

### Protected Routes

- `GET /profile`: Displays user profile (JWT protected)

## 📚 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js, JWT
- **OAuth Providers**: Google, GitHub
- **View Engine**: EJS
- **Security**: bcrypt, validator.js
- **Session Management**: express-session, connect-mongo

## 🔧 Development

### Adding New OAuth Providers

To add a new OAuth provider:

1. Install the appropriate Passport strategy package
2. Configure the strategy in `passport-setup.js`
3. Add new routes in `auth-routes.js`
4. Update user model if necessary to store provider IDs

### Custom Styling

The project uses EJS templates with custom CSS. To modify the styling:

1. Edit the CSS sections in the EJS files
2. Use the existing CSS variables for consistent theming

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

- **Techinho** - [GitHub Profile](https://github.com/Techinho)
