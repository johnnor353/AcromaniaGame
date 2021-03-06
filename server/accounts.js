import { SendBlacklistedEmailNotification } from "./imports/Emails";

Meteor.startup(function() {
  // login service configuration
  /*ServiceConfiguration.configurations.update(
    { service: "facebook" },
    {
      $set: {
        appId: Meteor.settings.facebook.appId,
        secret: Meteor.settings.facebook.appSecret
      }
    },
    { upsert: true }
  );

  ServiceConfiguration.configurations.update(
    { service: "twitter" },
    {
      $set: {
        consumerKey: Meteor.settings.twitter.consumerKey,
        secret: Meteor.settings.twitter.secret
      }
    },
    { upsert: true }
  );

  ServiceConfiguration.configurations.update(
    { service: "google" },
    {
      $set: {
        clientId: Meteor.settings.google.clientId,
        secret: Meteor.settings.google.secret
      }
    },
    { upsert: true }
  );*/
  process.env.MAIL_URL="smtps://whitebirdinbluesky1990@gmail.com:hjy199075@smtp.gmail.com:465";
});

Accounts.config({
  sendVerificationEmail: false
});

Accounts.urls.verifyEmail = function(token) {
  return Meteor.absoluteUrl("verify-email/" + token);
};

Accounts.urls.resetPassword = function(token) {
  return Meteor.absoluteUrl("reset-password/" + token);
};

Accounts.emailTemplates.from = "no-reply@acromania.com";
Accounts.emailTemplates.siteName = "Acromania";

Accounts.validateLoginAttempt(options => {
  // If the login has failed, just return false.
  if (!options.allowed) {
    return false;
  }

  // Check the user's email is verified. If users may have multiple
  // email addresses (or no email address) you'd need to do something
  // more complex.
  if (options.type !== "password" || options.user.emails[0].verified === true) {
    return true;
  } else {
    throw new Meteor.Error(
      "email-not-verified",
      "You must verify your email address before you can log in"
    );
  }
});

Accounts.onCreateUser(function(options, user) {
  user.profile = {};
  if (options.profile && options.profile.country) {
    user.profile.country = options.profile.country;
  }
  user.emails[0].verified = true;
  const userDetails = getUserDetails(user);
  user.profile.profilePicture = userDetails.profilePicture;

  return user;
});

Accounts.onLogin(function(details) {
  if (!details.user.profile || !details.user.profile.profilePicture) {
    const userDetails = getUserDetails(details.user);
    Meteor.users.update(details.user._id, {
      $set: { "profile.profilePicture": userDetails.profilePicture }
    });
  }
});

function getUserDetails(user) {
  const obj = {
    email: null,
    firstName: null,
    lastName: null,
    profilePicture: {}
  };

  if (user.services.password) {
    // see if they have a gravatar
    obj.email = user.emails[0].address;
    obj.firstName = user.username;
    obj.lastName = "";
    obj.profilePicture.type = "gravatar";
    obj.profilePicture.url = Gravatar.imageUrl(obj.email, {
      secure: true,
      default: "mm"
    });
  } else if (user.services.facebook) {
    obj.email = user.services.facebook.email;
    obj.firstName = user.services.facebook.first_name;
    obj.lastName = user.services.facebook.last_name;
    obj.profilePicture.type = "facebook";
    obj.profilePicture.url =
      "https://graph.facebook.com/v2.3/" +
      user.services.facebook.id +
      "/picture";
  } else if (user.services.google) {
    obj.email = user.services.google.email;
    obj.firstName = user.services.google.given_name;
    obj.lastName = user.services.google.family_name;
    obj.profilePicture.type = "google";
    obj.profilePicture.url = user.services.google.picture;
  } else if (user.services.twitter) {
    obj.email = user.services.twitter.email;
    obj.firstName = "";
    obj.lastName = "";
    obj.profilePicture.type = "twitter";
    obj.profilePicture.url = user.services.twitter.profile_image_url_https;
  }
  return obj;
}