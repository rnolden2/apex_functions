/* eslint-disable camelcase */
const firestore = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");
const xrpl = require("xrpl");

const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");

admin.initializeApp();

/**
 * Fetches transaction data from a specified hash.
 * @param {string} hash - The transaction hash.
 * @return {Promise<Object>} - The fetched transaction data.
 */
async function getTransactionData(hash) {
  await client.connect();
  try {
    const response = await client.request({
      command: "tx",
      transaction: hash,
    });
    const data = response.result;
    logger.info("Transaction data: ", data);
    return data;
  } catch (error) {
    logger.error("Error fetching transaction data: ", error);
    throw error;
  }
}

exports.sendEmail = firestore.onDocumentCreated(
    "quest_submissions/{doc}",
    (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        logger.info("No data associated with the event");
        return;
      }
      const data = snapshot.data();
      const email = data.email;
      const name = data.name;
      const track = data.track;
      if (track === "non-dev") {
        const devnet = data.quest.devnet;
        const hash = data.quest.hash;
        const install = data.quest.install;
        const signin = data.quest.signin;
        // Validate the transaction data
        getTransactionData(hash);
        if (devnet && hash.length > 6 && install && signin) {
          admin
              .firestore()
              .collection("mail")
              .add({
                message: {
                  subject: "Thanks for Completing the Crossmark Quest!",
                  html: `<p>Hi ${name},</p><br><p>Congratulations on completing the Crossmark Quest! Please come visit us at the Crossmark booth to claim your Wristband!</p><br><img src='https://storage.googleapis.com/maze-it-324504.appspot.com/images/titleblock.png' width=50%; height=auto;>`,
                },
                to: email,
                from: "intercoder@crossmark.io",
              });
        } else {
          admin
              .firestore()
              .collection("mail")
              .add({
                message: {
                  subject: "Thanks for Completing the Crossmark Quest!",
                  html: `<p>Hi ${name},</p><br><p>Unfortunately, you did not complete all tasks correctly. Please come visit us at the Crossmark booth for a chance to try again.</p><br><img src='https://storage.googleapis.com/maze-it-324504.appspot.com/images/titleblock.png' width=50%; height=auto;>`,
                },
                to: email,
                from: "intercoder@crossmark.io",
              });
        }
      } else {
        const quest = data.quest;
        const {
          experience,
          framework,
          install,
          sess,
          sess_res,
          sign_tx_res,
          sign_tx,
          signin,
          signin_res,
          submit_tx,
        } = quest;

        if (
          experience &&
          framework &&
          install &&
          sess &&
          sess_res &&
          sign_tx_res &&
          sign_tx &&
          signin &&
          signin_res &&
          submit_tx
        ) {
          admin
              .firestore()
              .collection("mail")
              .add({
                message: {
                  subject: "Thanks for Completing the Crossmark Quest!",
                  html: `<p>Hi ${name},</p><br><p>Congratulations on completing the Crossmark Quest! Please come visit us at the Crossmark booth to claim your T-Shirt!</p><br><img src='https://storage.googleapis.com/maze-it-324504.appspot.com/images/titleblock.png' width=50%; height=auto;>`,
                },
                to: email,
                from: "intercoder@crossmark.io",
              });
        } else {
          admin
              .firestore()
              .collection("mail")
              .add({
                message: {
                  subject: "Thanks for Completing the Crossmark Quest!",
                  html: `<p>Hi ${name},</p><br><p>Unfortunately, you did not complete all tasks correctly. Please come visit us at the Crossmark booth for a chance to try again.</p><br><img src='https://storage.googleapis.com/maze-it-324504.appspot.com/images/titleblock.png' width=50%; height=auto;>`,
                },
                to: email,
                from: "intercoder@crossmark.io",
              });
        }
      }
    },
);

