"use strict";

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { v4: generateUuid } = require("uuid");
const { generateFromString } = require('generate-avatar');
const sharp = require("sharp");
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const storage = new Storage();

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
  fastify.post("/", { schema: postUserSchema }, async (request, reply) => {
    const { email } = request.body;
    const verification_token = generateUuid();
    const placeholderImage = generateFromString(email);
    const userId = await fastify
      .knex("account")
      .insert({
        email,
        verification_token,
        is_verified: false,
        placeholderImage
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
          theme: { type: "string" }
        },
      },
    },
  };
  fastify.put(
    "/:email",
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
            .returning(["name", "email", "theme"])
        )[0];
      } else {
        reply.code(403).send("Invalid verification token.");
      }
    }
  );


  const putUserSettingsSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        theme: { type: "string" },
        file: { type: "string" },
        fileName: { type: "string" },
      },
    },
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
          theme: { type: "string" },
          file: { type: "string" },
          fileName: { type: "string" }
        },
      },
    },
  };
  fastify.put(
    "/:userId/settings",
    {
      schema: putUserSettingsSchema,
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
    },
    async function (request, reply) {
      const { name, theme, file, fileName } = request.body;

      let uploadedFileName;

      const { imageName: currentImageName } = await fastify.knex
        .from("account")
        .select("*")
        .where({
          id: request.params.userId,
        })
        .first();

      if (file) {
        let imageBuffer = Buffer.from(file.replace(/^data:.*\/.*;base64,/, ''), 'base64');
        const croppedImage = await sharp(imageBuffer)
          .resize({
            width: 300,
            height: 300,
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy
          })
          .toBuffer();
        const data = Buffer.from(croppedImage.toString('base64').replace(/^data:.*\/.*;base64,/, ''), 'base64');
        uploadedFileName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9_. -]/g, '')}`; // remove illegal characters
        const gcloudFile = await storage.bucket('user-file-storage').file(uploadedFileName);
        await gcloudFile.save(data);
        await gcloudFile.makePublic();
        if (currentImageName) {
          try {
            console.log(`deleting ${currentImageName}`);
            await storage.bucket('user-file-storage').file(currentImageName).delete();
          }
          catch (e) {
            console.error(e);
          }
        }
      }
      else if (file === "") {
        try {
          await storage.bucket('user-file-storage').file(currentImageName).delete();
        }
        catch (e) {
          console.error(e);
        }
        uploadedFileName = null;
      }

      return (
        await fastify
          .knex("account")
          .update({
            name,
            theme,
            imageName: uploadedFileName
          })
          .where("id", request.user.id)
          .returning(["name", "email", "theme", "imageName", "placeholderImage"])
      )[0];
    }
  );


  const getUserSchema = {
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
          theme: { type: "string" },
          placeholderImage: { type: "string" },
          imageName: { type: "string" },
        },
      },
    },
  };
  // Get one user
  fastify.get(
    "/:userId",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: getUserSchema,
    },
    async function (request, reply) {
      return await fastify
        .knex("account")
        .select("name", "email", "theme", "placeholderImage", "imageName")
        .where("id", request.params.userId)
        .first();
    }
  );

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
    "/:email/resets",
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
    "/:email/password",
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
              verification_token: null,
            })
            .where("email", email)
            .returning(["name", "email"])
        )[0];
      } else {
        reply.code(403).send("Invalid verification token.");
      }
    }
  );

  const getTeamsSchema = {
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
            isAdmin: {
              type: "boolean",
            },
            isOwner: {
              type: "boolean",
            },
          },
        },
      },
    },
  };
  fastify.get(
    "/:userId/teams",
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
          "account_team.isAdmin",
          "account_team.isOwner"
        )
        .where("account_id", request.params.userId)
        .join("team", "team.id", "=", "account_team.team_id");
    }
  );

  const getInvitesSchema = {
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
            inviterName: { type: "string" },
            teamName: { type: "string" },
          },
        },
      },
    },
  };
  fastify.get(
    "/:userId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: getInvitesSchema,
    },
    async function (request, reply) {
      return await fastify
        .knex("teamInvite")
        .select(
          "teamInvite.id",
          "inviter.name as inviterName",
          "team.name as teamName"
        )
        .where("teamInvite.inviteeEmail", request.user.email)
        .join("account as inviter", "inviter.id", "=", "teamInvite.inviter_id")
        .join("team", "team.id", "=", "teamInvite.team_id");
    }
  );

  const acceptInviteSchema = {
    body: {
      type: "object",
      required: ["inviteId"],
      properties: {
        inviteId: { type: "string" },
      },
    },
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
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
    response: {
      200: {
        type: "array",
        items: { type: "string" },
      },
    },
  };
  fastify.post(
    "/:userId/teams",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: acceptInviteSchema,
    },
    async function (request, reply) {
      // get invite
      const inviteId = fastify.deobfuscateId(request.body.inviteId);
      const invite = await fastify
        .knex("teamInvite")
        .select("*")
        .where("id", inviteId)
        .first();

      // add member to team
      if (invite) {
        const { team_id, isAdmin } = invite;

        const memberAlreadyExists = await fastify
          .knex("account_team")
          .select("*")
          .where({ account_id: request.user.id, team_id })
          .first();

        if (!memberAlreadyExists) {
          await fastify.knex("account_team").insert({
            account_id: request.user.id,
            team_id,
            isAdmin,
            isOwner: false,
          });
        }

        // delete invite
        await fastify
          .knex("teamInvite")
          .select("*")
          .where("id", inviteId)
          .del();

        return ["success"];
      }
      reply.code(400);
      return ["invalid invite"];
    }
  );

  const deleteInviteSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userId: { type: "number" },
        inviteId: { type: "number" },
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
        type: "array",
        items: { type: "string" },
      },
    },
  };
  fastify.delete(
    "/:userId/invites/:inviteId",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: deleteInviteSchema,
    },
    async function (request, reply) {
      // get invite
      const invite = await fastify
        .knex("teamInvite")
        .select("*")
        .where({
          id: request.params.inviteId,
          inviteeEmail: request.user.email,
        })
        .first();

      if (invite) {
        // delete invite
        await fastify
          .knex("teamInvite")
          .select("*")
          .where("id", request.params.inviteId)
          .del();

        return ["success"];
      }
      reply.code(400);
      return ["invalid invite"];
    }
  );

  const leaveTeamSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userId: { type: "number" },
        inviteId: { type: "number" },
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
        type: "array",
        items: { type: "string" },
      },
    },
  };
  fastify.delete(
    "/:userId/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isCorrectUser],
      schema: leaveTeamSchema,
    },
    async function (request, reply) {
      const membership = await fastify
        .knex("account_team")
        .select("*")
        .where({
          account_id: request.params.userId,
          team_id: request.params.teamId,
        })
        .first();

      if (!membership.isOwner) {
        await fastify
          .knex("account_team")
          .select("*")
          .where({
            account_id: request.params.userId,
            team_id: request.params.teamId,
            isOwner: false,
          })
          .del();
        return ["success"];
      }
      reply.code(400);
      return ["owner cannot leave team"];
    }
  );
};
