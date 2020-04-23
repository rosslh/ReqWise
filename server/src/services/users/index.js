"use strict";

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { v4: generateUuid } = require("uuid");

module.exports = async (fastify, opts) => {
  // Generate test SMTP service account from ethereal.email
  const testEmailAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testEmailAccount.user, // generated ethereal user
      pass: testEmailAccount.pass, // generated ethereal password
    },
  });

  const postUserSchema = {
    body: {
      type: "object",
      required: ["email"],
      properties: {
        email: { type: "string" },
      },
    },
    queryString: {},
    params: {},
    headers: {
      type: "object",
      properties: {
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
    response: {
      200: {
        type: "number",
      },
    },
  };
  fastify.post("/users", { schema: postUserSchema }, async (request, reply) => {
    const { email } = request.body;
    const verification_token = generateUuid();
    const userId = await fastify
      .knex("account")
      .insert({
        email,
        verification_token,
        is_verified: false,
      })
      .returning("id");

    const info = await transporter.sendMail({
      from: `"ReqWise" <${testEmailAccount.user}>`, // sender address
      to: email, // comma separated list of receivers
      subject: "Verify your email address", // Subject line
      text: `Follow this link to verify your account: https://reqwise.com/sign-up/complete?token=${encodeURIComponent(
        verification_token
      )}&email=${encodeURIComponent(email)}`, // plain text body
      html: `<a href='https://reqwise.com/sign-up/complete?token=${encodeURIComponent(
        verification_token
      )}&email=${encodeURIComponent(
        email
      )}'>Follow this link to verify your account</a>.`, // html body
    });

    request.log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return userId[0];
  });

  // Update one user
  const putUserSchema = {
    body: {
      type: "object",
      required: ["name", "password", "token"],
      properties: {
        name: { type: "string" },
        password: { type: "string" },
        token: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        email: { type: "string" },
      },
    },
    headers: {
      type: "object",
      properties: {
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
      },
    },
  };
  fastify.put(
    "/users/:email",
    {
      schema: putUserSchema,
    },
    async function (request, reply) {
      const { name, password, token } = request.body;
      const { email } = request.params;
      const { verification_token } = await fastify
        .knex("account")
        .select("verification_token", "email")
        .where("email", email)
        .first();
      if (token === verification_token) {
        return (
          await fastify
            .knex("account")
            .update({
              name,
              is_verified: true,
              verification_token: null, // don't allow reseting with original token
              password_hash: bcrypt.hashSync(password, 10),
            })
            .where("email", email)
            .returning(["name", "email"])
        )[0];
      } else {
        reply.code(403).send("Invalid verification token.");
      }
    }
  );

  const getUserSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        id: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: {
          type: "string",
        },
      },
      required: ["Authorization"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
      },
    },
  };
  // Get one user
  fastify.get(
    "/users/:userId",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: getUserSchema,
    },
    async function (request, reply) {
      return await fastify
        .knex("account")
        .select("name", "email")
        .where("id", request.params.userId)
        .first();
    }
  );

  const getTeamsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        userId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: {
          type: "string",
        },
      },
      required: ["Authorization"],
    },
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            description: {
              type: "string",
            },
            is_admin: {
              type: "boolean",
            },
          },
        },
      },
    },
  };

  const resetPasswordSchema = {
    body: {
      type: "object",
      properties: {},
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        email: { type: "string" },
      },
    },
    headers: {
      type: "object",
      properties: {
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
    response: {
      200: {
        type: "object",
        properties: {},
      },
    },
  };
  fastify.post(
    "/users/:email/resets",
    { schema: resetPasswordSchema },
    async function (request, reply) {
      // Set new verification token
      // Send new email
      const { email } = request.params;
      const verification_token = generateUuid();
      const user = await fastify
        .knex("account")
        .update({
          verification_token,
        })
        .where("email", email)
        .returning(["name", "email"]);

      const info = await transporter.sendMail({
        from: `"ReqWise" <${testEmailAccount.user}>`, // sender address
        to: email, // comma separated list of receivers
        subject: "Password reset request", // Subject line
        text: `Follow this link to reset your ReqWise password: https://reqwise.com/reset/complete?token=${encodeURIComponent(
          verification_token
        )}&email=${encodeURIComponent(email)}`, // plain text body
        html: `<a href='https://reqwise.com/reset/complete?token=${encodeURIComponent(
          verification_token
        )}&email=${encodeURIComponent(
          email
        )}'>Follow this link to reset your ReqWise password</a>.`, // html body
      });

      request.log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

      return user;
    }
  );

  const updatePasswordSchema = {
    body: {
      type: "object",
      required: ["password", "token"],
      properties: {
        password: { type: "string" },
        token: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        email: { type: "string" },
      },
    },
    headers: {
      type: "object",
      properties: {
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
    response: {
      200: {
        type: "object",
        properties: {},
      },
    },
  };
  fastify.put(
    "/users/:email/password",
    { schema: updatePasswordSchema },
    async function (request, reply) {
      const { token, password } = request.body;
      const { email } = request.params;
      const { verification_token } = await fastify
        .knex("account")
        .select("verification_token", "email")
        .where("email", email)
        .first();
      if (verification_token && verification_token === token) {
        return (
          await fastify
            .knex("account")
            .update({
              password_hash: bcrypt.hashSync(password, 10),
            })
            .where("email", email)
            .returning(["name", "email"])
        )[0];
      } else {
        reply.code(403).send("Invalid verification token.");
      }
    }
  );

  // Get a user's teams
  fastify.get(
    "/users/:userId/teams",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: getTeamsSchema,
    },
    async function (request, reply) {
      return await fastify
        .knex("account_team")
        .select(
          "team.id",
          "team.name",
          "team.description",
          "account_team.is_admin"
        )
        .where("account_id", request.params.userId)
        .join("team", "team.id", "=", "account_team.team_id");
    }
  );
};
