# google-oauth2-ts

The original purpose of this repo was to be a generic OAuth2 solution. But after learning about OAuth2 and my user's requirements. I only need Google login, and Google handles the Authentication. As such, we only need a way to login with a valid Google ID token, and some of the OAuth2 spec.
This repository will implement /token for grant_type=refresh_token, and an /introspect for our resource server(s) to validate my access tokens. I may layer in some basic permissions.

## built with

- Typescript
- NodeJs
- Express
- Mongo

## Getting Started

<To do>


## Installation

1. git clone `https://github.com/nmarsh92/google-oauth2-ts`
2. npm install
3. Add `.env` with variables (listed below)
4. npm build
5. npm run dev


### .env variables
```
<tbd>
```
