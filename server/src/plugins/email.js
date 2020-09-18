const nodemailer = require("nodemailer");
const sendgrid = require('nodemailer-sendgrid');
const Mustache = require("mustache");
const path = require("path");
const fs = require("fs");
const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {
  const transporter = nodemailer.createTransport(sendgrid({
    apiKey: process.env.SENDGRID_API_KEY
  }));

  const getEmailTemplate = (templateName) => path.resolve(__dirname, "../email-templates", `${templateName}.html`);

  fastify.decorate("sendEmail", async function (toEmail, plaintext, subject, templateName, vars) {
    await transporter.sendMail({
      from: `"ReqWise" <noreply@reqwise.com>`, // sender address
      to: toEmail, // comma separated list of receivers
      subject, // Subject line
      text: plaintext, // plain text body
      html: Mustache.render(
        fs.readFileSync(getEmailTemplate(templateName)).toString(),
        {
          ...vars
        }
      )
    });
  });

  done();
});
