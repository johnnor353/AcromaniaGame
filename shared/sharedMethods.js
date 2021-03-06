import { checkValidChatString } from "../imports/validators";
import { Games, Lobbies, GlobalFeed, LobbyFeed } from "../imports/collections";

Meteor.methods({
  addLobbyFeedChat(lobbyId, message) {
    if (!this.userId)
      throw new Meteor.Error("403", "You must be logged in to do that");

    check(message, checkValidChatString);
    // Set chat message as a hidden if user is shadowbanned
    const hidden = _.get(Meteor.users.findOne(this.userId, {fields: {profile: true}}), "profile.shadowbanned", false);
    LobbyFeed.insert({lobbyId: lobbyId, user: this.userId, timestamp: new Date(), detail: message, hidden});
    Lobbies.findOne(lobbyId, {$currentDate: {lastUpdated: true}});
  },
  addGlobalFeedChat(message) {
    if (!this.userId)
      throw new Meteor.Error("403", "You must be logged in to do that");

    check(message, checkValidChatString);

    // Set chat message as a hidden if user is shadowbanned
    const hidden = _.get(
      Meteor.users.findOne(this.userId, { fields: { profile: true } }),
      "profile.shadowbanned",
      false
    );

    GlobalFeed.insert({
      user: this.userId,
      timestamp: new Date(),
      detail: message,
      hidden
    });
  },
  markNagAsClosed(id) {
    if (this.userId)
      Meteor.users.update(this.userId, {
        $addToSet: { "profile.closedNags": id }
      });
  },
  toggleNotifications(state) {
    if (this.userId) {
      check(state, Boolean);
      Meteor.users.update(this.userId, {
        $set: { "profile.notificationsEnabled": state }
      });
    }
  },
  toggleSounds(state) {
    if (this.userId) {
      check(state, Boolean);
      Meteor.users.update(this.userId, {
        $set: { "profile.soundsEnabled": state }
      });
    }
  },

  faceVoteForAcro(gameId, playerId) {
    let game;

    if (!this.isSimulation) {
      game = standardMethodChecks(gameId, this.userId, "face_voting");
    } else {
      game = Games.findOne(gameId);
    }

    const currentRoundIndex = game.currentRound - 1;
    if (!game.rounds[currentRoundIndex].players[playerId])
      throw new Meteor.Error(
        "no-permission",
        "You don't have permission to do that"
      );

    const setObj = {};
    setObj[
      "rounds." + currentRoundIndex + ".players." + this.userId + ".vote"
    ] = playerId;

    Games.update(gameId, { $set: setObj });

    //if this is the last vote cast, advance the game phase
    if (!this.isSimulation) {
      const currentRound = game.rounds[currentRoundIndex],
        totalPlayers = Object.values(currentRound.players).filter(player => player.role == "voter").length - 1;
      let submittedPlayers = 0;
      _.each(currentRound.players, (player, playerId) => {
        if (playerId !== this.userId && player.vote) {
          submittedPlayers++;
        }
      });
      if (submittedPlayers === totalPlayers) {
        const GameManager = require("../server/imports/GameManager");
        GameManager.default.advancePhase(gameId, "face_voting", game.currentRound);
      }
    }
  },

  voteForAcro(gameId, playerId) {
    let game;

    if (!this.isSimulation) {
      game = standardMethodChecks(gameId, this.userId, "voting");
    } else {
      game = Games.findOne(gameId);
    }

    const currentRoundIndex = game.currentRound - 1;
    if (!game.rounds[currentRoundIndex].players[playerId])
      throw new Meteor.Error(
        "no-permission",
        "You don't have permission to do that"
      );

    const setObj = {};
    setObj[
      "rounds." + currentRoundIndex + ".players." + this.userId + ".vote"
    ] = playerId;

    Games.update(gameId, { $set: setObj });

    //if this is the last vote cast, advance the game phase
    if (!this.isSimulation) {
      const currentRound = game.rounds[currentRoundIndex],
        totalPlayers = Object.keys(currentRound.players).length - 1;
      let submittedPlayers = 0;
      _.each(currentRound.players, (player, playerId) => {
        if (playerId !== this.userId && player.vote) {
          submittedPlayers++;
        }
      });
      if (submittedPlayers === totalPlayers) {
        const GameManager = require("../server/imports/GameManager");
        GameManager.default.advancePhase(gameId, "voting", game.currentRound);
      }
    }
  }
});

if (Meteor.isServer) {
  // Rate limit chats to one per second
  const methodNames = ["addLobbyFeedChat", "addGlobalFeedChat"];
  DDPRateLimiter.addRule(
    {
      name(name) {
        return methodNames.includes(name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      }
    },
    1,
    1000
  );
}
