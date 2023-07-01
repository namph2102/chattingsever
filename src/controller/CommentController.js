import CommentModel from "../model/commentModel.js";
import * as cheerio from "cheerio";
import axios from "axios";

class CommentController {
  async createComment(room, comment, author, type, isSee = true) {
    try {
      return await CommentModel.create({ room, comment, author, type, isSee });
    } catch (err) {
      console.log(err);
    }
  }
  async CrawLink(req, res) {
    try {
      const link = req.body.data;
      const result = await axios.get(link, {
        crossdomain: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
      const data = await result.data;

      const $ = cheerio.load(data);
      const title = $("title").text() || "";
      const image = $("meta[property='og:image']").attr("content") || "";
      const description = $("meta[name='description']").attr("content") || "";
      if (!title || !image || !description) throw new Error("Không lấy được");
      return res.status(201).json({
        link: title + "*" + description + "*" + image + "*" + link + "*",
        statusCode: 201,
      });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
}

export default new CommentController();
