import axios from "axios";
import Database from "./Database.js";

class Board {
  constructor(name) {
    this.name = name;
    this.root = `https://a.4cdn.org/${this.name}`;

    this.endpoints = {
      catalog: "/catalog.json",
      replies: "/thread/_ID_.json",
    };
  }

  makeRequest(endpoint, id = false) {
    // Redundant function built for the future.
    // TODO:
    //  - Proxies?
    //  - Random user-agent?
    if (id) {
      endpoint = endpoint.replace("_ID_", id);
    }

    return new Promise(async (resolve, reject) => {
      axios
        .get(`${this.root}${endpoint}?t=${Date.now()}`)
        .then((res) => {
          console.log(`200: ${this.root}${endpoint}?t=${Date.now()}`);
          resolve(res);
        })
        .catch((err) => {
          console.log(`ERR: ${this.root}${endpoint}?t=${Date.now()}`);
          reject(err);
        });
    });
  }

  respectRateLimit(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  getThreads() {
    return new Promise((resolve) => {
      const threads = [];

      this.makeRequest(this.endpoints.catalog)
        .then((resp) => {
          resp.data.forEach((page) => threads.push(...page.threads));
          resolve(threads);
        })
        .catch((err) => resolve([]));
    });
  }

  getReplies(id) {
    return new Promise((resolve) => {
      this.makeRequest(this.endpoints.replies, id)
        .then((resp) => resolve(resp.data.posts.filter((i) => i.no !== id)))
        .catch((err) => resolve([]));
    });
  }

  async getAllPosts(database) {
    const posts = [];
    const threads = await this.getThreads();

    for (let thread of threads) {
      const replies = database.getReplyCount(this.name, thread.no);

      if (replies != -1 && replies == thread.replies) {
        console.log("Dead, no updates");
        continue;
      }

      posts.push({
        parent: thread,
        replies: await this.getReplies(thread.no),
      });

      await this.respectRateLimit(100);
    }

    return posts;
  }
}

export default Board;
