import Board from "./classes/Board.js";
import Database from "./classes/Database.js";

// TODO: Move this to JSON elsewhere, or dynamic fetch the list.
const boards = [
  "adv",
  "b",
  "bant",
  "biz",
  "fa",
  "fit",
  "g",
  "k",
  "lit",
  "mu",
  "news",
  "out",
  "pol",
  "r9k",
  "sci",
  "x",
];

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

!(async function main() {
  const db = new Database();

  while (true) {
    for (let name of boards) {
      const board = new Board(name);
      const threads = await board.getAllPosts(db);

      for (let thread of threads) {
        db.insertThreadAndReplies(thread, name);
      }
    }

    console.log("Finished, sleeping for next pass.");
    await timeout(1000 * 20);
  }
})();
